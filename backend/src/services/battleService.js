const { BattleRoom, BattleTable, UserStatus, User, Game } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const UserStatusHistory = require('../models/UserStatusHistory');

class BattleService {
  // 获取游戏的所有房间
  static async getGameRooms(gameId) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 getGameRooms ===');
      const rooms = await BattleRoom.findAll({
        where: { game_id: gameId },
        order: [['room_id', 'ASC']]
      });
      
      return rooms.map(room => ({
        id: room.id,
        room_id: room.room_id,
        name: room.name,
        status: room.status,
        online_users: room.online_users,
        game_id: room.game_id
      }));
    } catch (error) {
      console.error('获取游戏房间失败:', error);
      throw error;
    }
  }

  // 获取房间内的所有桌子
  static async getRoomTables(roomId) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 getRoomTables ===');
      // 首先获取房间信息，包括game_id
      const room = await BattleRoom.findByPk(roomId);
      if (!room) {
        throw new Error('房间不存在');
      }

      // 获取游戏信息，包括座位配置
      const game = await Game.findByPk(room.game_id);
      if (!game) {
        throw new Error('游戏不存在');
      }

      const tables = await BattleTable.findAll({
        where: { room_id: roomId },
        order: [['table_id', 'ASC']],
        include: [
          {
            model: User,
            as: 'seat1User',
            attributes: ['id', 'username', 'avatar', 'level'],
            required: false
          },
          {
            model: User,
            as: 'seat2User',
            attributes: ['id', 'username', 'avatar', 'level'],
            required: false
          },
          {
            model: User,
            as: 'seat3User',
            attributes: ['id', 'username', 'avatar', 'level'],
            required: false
          },
          {
            model: User,
            as: 'seat4User',
            attributes: ['id', 'username', 'avatar', 'level'],
            required: false
          }
        ]
      });
      
      return tables.map(table => ({
        id: table.id,
        table_id: table.table_id,
        status: table.status,
        current_players: table.current_players,
        max_players: table.max_players,
        max_seat: game.max_seat,
        available_seats: game.available_seats || [1, 2, 3, 4],
        seats: {
          1: table.seat1User,
          2: table.seat2User,
          3: table.seat3User,
          4: table.seat4User
        }
      }));
    } catch (error) {
      console.error('获取房间桌子失败:', error);
      throw error;
    }
  }

  // 用户进入房间 - 新版本，包含完整的状态管理
  static async userEnterRoom(userId, roomId) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 userEnterRoom ===');
      console.log('=== [userEnterRoom] 开始处理用户进入房间 ===');
      console.log('📥 输入参数:', { userId, roomId });
      
      const room = await BattleRoom.findByPk(roomId);
      if (!room) {
        console.log('❌ 房间不存在:', roomId);
        throw new Error('房间不存在');
      }

      console.log(`🔍 找到房间: ${room.name} (ID: ${room.id})`);

      // 检查房间是否已满员
      if (room.online_users >= room.max_user) {
        console.log(`❌ 房间已满员: ${room.online_users}/${room.max_user}`);
        throw new Error('房间已满员');
      }

      // 1. 获取用户当前状态
      const currentUserStatus = await UserStatus.findOne({
        where: { user_id: userId }
      });

      console.log(`🔍 用户当前状态:`, currentUserStatus ? currentUserStatus.toJSON() : '无状态记录');

      // 2. 创建用户状态历史记录
      if (currentUserStatus) {
        console.log(`🔧 创建状态历史记录...`);
        
        await UserStatusHistory.create({
          user_id: userId,
          room_id: currentUserStatus.room_id,
          table_id: currentUserStatus.table_id,
          seat_number: currentUserStatus.seat_number,
          status: currentUserStatus.status,
          action: 'enter_room',
          previous_status: currentUserStatus.status,
          previous_room_id: currentUserStatus.room_id,
          previous_table_id: currentUserStatus.table_id,
          previous_seat_number: currentUserStatus.seat_number,
          metadata: JSON.stringify({
            from_room_id: currentUserStatus.room_id,
            to_room_id: roomId,
            reason: 'user_clicked_room'
          })
        });
        
        console.log(`✅ 状态历史记录创建成功`);
      }

      // 3. 检查并清理用户当前占用的座位
      console.log(`🔍 检查用户当前占用的座位...`);
      const currentTableInfo = await this.getUserCurrentTable(userId);
      
      if (currentTableInfo) {
        console.log(`🔧 用户当前占用座位: 桌子 ${currentTableInfo.tableId} 座位 ${currentTableInfo.seatNumber}`);
        
        // 获取桌子信息
        const currentTable = await BattleTable.findByPk(currentTableInfo.tableId);
        if (currentTable) {
          console.log(`🔍 当前桌子状态:`, {
            id: currentTable.id,
            status: currentTable.status,
            current_players: currentTable.current_players
          });
          
          // 3.1 如果当前正在游戏，需要结束游戏
          if (currentTable.status === 'playing') {
            console.log(`🔧 当前桌子正在游戏中，需要结束游戏`);
            // TODO: 发送结束游戏socket事件
            // socket.emit('end_game', { tableId: currentTable.id });
          }
          
          // 3.2 清理座位占用
          console.log(`🔧 清理用户座位占用...`);
          await this.userLeaveTable(userId, currentTableInfo.tableId, currentTableInfo.seatNumber);
          console.log(`✅ 座位清理完成`);
        }
      } else {
        console.log(`✅ 用户当前没有占用任何座位`);
      }

      // 4. 更新用户状态 - 进入新房间，清空桌子和座位信息
      const newUserStatus = {
        user_id: userId,
        room_id: roomId,
        table_id: null,
        seat_number: null,
        status: 'idle',
        last_activity: new Date()
      };
      
      console.log(`🔧 更新用户状态:`, newUserStatus);
      await UserStatus.upsert(newUserStatus);
      console.log(`✅ 用户状态更新成功`);

      // 5. 增加房间在线用户数
      console.log(`🔧 增加房间在线用户数...`);
      await room.increment('online_users');
      
      // 重新加载房间数据
      await room.reload();
      console.log(`📊 房间更新后状态:`, {
        online_users: room.online_users,
        max_user: room.max_user,
        status: room.status
      });
      
      // 检查房间是否满员
      if (room.online_users >= room.max_user) {
        await room.update({ status: '满员' });
        console.log(`🔧 房间已满员，更新状态为满员`);
      }

      const result = { 
        success: true, 
        room: room.toJSON(),
        previousTableInfo: currentTableInfo
      };
      
      console.log(`✅ userEnterRoom执行完成，返回结果:`, result);
      console.log('=== [userEnterRoom] 处理完成 ===');
      
      return result;
    } catch (error) {
      console.error('❌ 用户进入房间失败:', error);
      console.error('❌ 错误堆栈:', error.stack);
      throw error;
    }
  }

  // 用户离开房间
  static async userLeaveRoom(userId, roomId) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 userLeaveRoom ===');
      const room = await BattleRoom.findByPk(roomId);
      if (!room) {
        throw new Error('房间不存在');
      }

      // 如果用户在桌子中，先离开桌子
      const userStatus = await UserStatus.findOne({
        where: { user_id: userId }
      });

      if (userStatus && userStatus.table_id) {
        await this.userLeaveTable(userId, userStatus.table_id, userStatus.seat_number);
      }

      // 更新用户状态
      await UserStatus.update({
        room_id: null,
        table_id: null,
        seat_number: null,
        status: 'idle',
        last_activity: new Date()
      }, {
        where: { user_id: userId }
      });

      // 减少房间在线用户数
      await room.decrement('online_users');
      
      // 如果房间不再满员，更新状态
      if (room.online_users < room.max_user) {
        await room.update({ status: '未满员' });
      }

      return { success: true };
    } catch (error) {
      console.error('用户离开房间失败:', error);
      throw error;
    }
  }

  // 用户加入桌子座位
  static async userJoinTable(userId, tableId, seatNumber) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 userJoinTable ===');
      console.log('=== [userJoinTable] 开始处理用户加入桌子 ===');
      console.log('📥 输入参数:', { userId, tableId, seatNumber });
      
      const table = await BattleTable.findByPk(tableId);
      if (!table) {
        console.log('❌ 桌子不存在:', tableId);
        throw new Error('桌子不存在');
      }

      console.log(`🔧 用户 ${userId} 加入桌子 ${tableId} 座位 ${seatNumber}`);
      console.log(`📊 桌子当前状态:`, {
        id: table.id,
        table_id: table.table_id,
        room_id: table.room_id,
        current_players: table.current_players,
        status: table.status,
        seat_1_user_id: table.seat_1_user_id,
        seat_2_user_id: table.seat_2_user_id,
        seat_3_user_id: table.seat_3_user_id,
        seat_4_user_id: table.seat_4_user_id
      });

      // 检查座位是否已被占用（被其他用户占用）
      const seatField = `seat_${seatNumber}_user_id`;
      console.log(`🔍 检查座位字段: ${seatField}, 当前值: ${table[seatField]}`);
      
      if (table[seatField] && table[seatField] !== userId) {
        console.log(`❌ 座位 ${seatNumber} 已被其他用户 ${table[seatField]} 占用`);
        throw new Error('座位已被其他用户占用');
      }

      // 检查用户是否已在其他座位（同一张桌子）
      console.log('🔍 检查用户是否已在同一张桌子的其他座位...');
      const existingSeat = await this.getUserSeat(userId, tableId);
      console.log(`🔍 用户在同一张桌子的座位检查结果: ${existingSeat}`);
      
      let isSeatSwitch = false;
      let isTableSwitch = false;
      let oldTableInfo = null;
      
      if (existingSeat) {
        if (existingSeat === seatNumber) {
          console.log(`❌ 用户已在该座位 ${existingSeat}`);
          throw new Error('用户已在该座位');
        }
        console.log(`🔄 用户 ${userId} 从座位 ${existingSeat} 切换到座位 ${seatNumber}（同一张桌子）`);
        isSeatSwitch = true;
      } else {
        // 检查用户是否在其他桌子中
        console.log('🔍 检查用户是否在其他桌子中...');
        const currentTableInfo = await this.getUserCurrentTable(userId);
        console.log(`🔍 用户当前桌子信息:`, currentTableInfo);
        
        if (currentTableInfo && currentTableInfo.tableId !== tableId) {
          console.log(`🔄 用户 ${userId} 从桌子 ${currentTableInfo.tableId} 座位 ${currentTableInfo.seatNumber} 切换到桌子 ${tableId} 座位 ${seatNumber}`);
          isTableSwitch = true;
          oldTableInfo = currentTableInfo;
        }
      }

      // 如果是跨桌子切换，先离开原桌子
      if (isTableSwitch && oldTableInfo) {
        console.log(`🔧 处理跨桌子切换，离开原桌子 ${oldTableInfo.tableId} 座位 ${oldTableInfo.seatNumber}`);
        
        // 释放原桌子的座位 - 使用更安全的方式
        const oldSeatField = `seat_${oldTableInfo.seatNumber}_user_id`;
        console.log(`🔧 处理跨桌子切换，离开原桌子 ${oldTableInfo.tableId} 座位 ${oldTableInfo.seatNumber}`);
        console.log(`🔧 原桌子字段: ${oldSeatField}`);
        
        // 先查询原桌子的当前状态
        const oldTable = await BattleTable.findByPk(oldTableInfo.tableId);
        if (oldTable) {
          console.log(`🔍 原桌子当前状态:`, {
            id: oldTable.id,
            current_players: oldTable.current_players,
            status: oldTable.status,
            [oldSeatField]: oldTable[oldSeatField]
          });
          
          // 计算新的玩家数量
          const newCurrentPlayers = Math.max(0, oldTable.current_players - 1);
          const newStatus = newCurrentPlayers < 2 ? 'empty' : 'waiting';
          
          console.log(`🔧 计算新状态: current_players = ${newCurrentPlayers}, status = ${newStatus}`);
          
          // 执行更新
          await oldTable.update({
            [oldSeatField]: null,
            current_players: newCurrentPlayers,
            status: newStatus
          });
          
          console.log(`✅ 原桌子更新成功: 桌子 ${oldTableInfo.tableId} 座位 ${oldTableInfo.seatNumber} 已释放`);
        } else {
          console.log(`❌ 找不到原桌子 ${oldTableInfo.tableId}`);
        }
        
        console.log(`✅ 释放原桌子 ${oldTableInfo.tableId} 座位 ${oldTableInfo.seatNumber}`);
      }

      // 如果是同一张桌子内的座位切换，先释放原座位
      if (isSeatSwitch) {
        const oldSeatField = `seat_${existingSeat}_user_id`;
        console.log(`🔧 处理同桌子座位切换，释放原座位 ${existingSeat}`);
        console.log(`🔧 原座位字段: ${oldSeatField}`);
        
        // 使用Sequelize模型更新，更安全
        await table.update({
          [oldSeatField]: null
        });
        
        console.log(`✅ 释放原座位 ${existingSeat}`);
        
        // 重新加载桌子数据
        console.log('🔄 重新加载桌子数据...');
        await table.reload();
        console.log(`📊 重新加载后的桌子状态:`, {
          current_players: table.current_players,
          status: table.status,
          seat_1_user_id: table.seat_1_user_id,
          seat_2_user_id: table.seat_2_user_id,
          seat_3_user_id: table.seat_3_user_id,
          seat_4_user_id: table.seat_4_user_id
        });
      }

      // 占用新座位
      console.log(`🔍 更新前桌子状态:`, {
        current_players: table.current_players,
        status: table.status,
        isSeatSwitch,
        isTableSwitch
      });
      
      const newCurrentPlayers = (isSeatSwitch || isTableSwitch) ? table.current_players : table.current_players + 1;
      // 状态逻辑：0个玩家=empty, 1个玩家=waiting, 2个以上玩家=waiting
      const newStatus = newCurrentPlayers >= 1 ? 'waiting' : 'empty';
      
      const updateData = {
        [seatField]: userId,
        current_players: newCurrentPlayers,
        status: newStatus
      };
      
      console.log(`🔧 计算新状态:`, {
        newCurrentPlayers,
        newStatus,
        updateData
      });
      
      console.log(`🔧 执行更新操作...`);
      console.log(`🔧 更新数据:`, updateData);
      
      // 使用直接SQL更新来确保更新生效
      const updateResult = await sequelize.query(
        `UPDATE battle_tables SET ${seatField} = ?, current_players = ?, status = ? WHERE id = ?`,
        {
          replacements: [userId, newCurrentPlayers, newStatus, tableId],
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      console.log(`🔧 SQL更新结果:`, updateResult);
      console.log(`✅ 桌子更新成功`);
      
      // 重新加载桌子数据以确认更新
      await table.reload();
      console.log(`📊 更新后桌子状态:`, {
        current_players: table.current_players,
        status: table.status,
        seat_1_user_id: table.seat_1_user_id,
        seat_2_user_id: table.seat_2_user_id,
        seat_3_user_id: table.seat_3_user_id,
        seat_4_user_id: table.seat_4_user_id
      });

      // 更新用户状态 - 使用upsert确保记录存在
      const userStatusData = {
        user_id: userId,
        room_id: table.room_id,
        table_id: tableId,
        seat_number: seatNumber,
        status: 'waiting',
        last_activity: new Date()
      };
      console.log(`🔧 更新用户状态:`, userStatusData);
      
      await UserStatus.upsert(userStatusData);
      console.log(`✅ 用户状态更新成功: 用户 ${userId} 在房间 ${table.room_id} 桌子 ${tableId} 座位 ${seatNumber}`);

      // 更新房间在线用户数（只在非座位切换和非跨桌子切换时增加）
      if (!isSeatSwitch && !isTableSwitch) {
        console.log('🔧 更新房间在线用户数...');
        const room = await BattleRoom.findByPk(table.room_id);
        if (room) {
          await room.increment('online_users');
          console.log(`✅ 房间 ${table.room_id} 在线用户数增加`);
        }
      }

      const result = { 
        success: true, 
        table: table.toJSON(),
        isSeatSwitch,
        isTableSwitch,
        oldSeat: isSeatSwitch ? existingSeat : null,
        oldTableInfo: oldTableInfo
      };
      
      console.log(`✅ userJoinTable执行完成，返回结果:`, result);
      console.log('=== [userJoinTable] 处理完成 ===');
      
      return result;
    } catch (error) {
      console.error('❌ 用户加入桌子失败:', error);
      console.error('❌ 错误堆栈:', error.stack);
      throw error;
    }
  }

  // 用户离开桌子座位
  static async userLeaveTable(userId, tableId, seatNumber) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 userLeaveTable ===');
      const table = await BattleTable.findByPk(tableId);
      if (!table) {
        throw new Error('桌子不存在');
      }

      const seatField = `seat_${seatNumber}_user_id`;
      
      // 检查用户是否在该座位
      if (table[seatField] !== userId) {
        throw new Error('用户不在该座位');
      }

      // 释放座位 - 使用Sequelize模型更新
      const newCurrentPlayers = Math.max(0, table.current_players - 1);
      const newStatus = newCurrentPlayers < 2 ? 'empty' : 'waiting';
      
      await table.update({
        [seatField]: null,
        current_players: newCurrentPlayers,
        status: newStatus
      });

      // 更新用户状态
      await UserStatus.update({
        table_id: null,
        seat_number: null,
        status: 'idle',
        last_activity: new Date()
      }, {
        where: { user_id: userId }
      });

      return { success: true };
    } catch (error) {
      console.error('用户离开桌子失败:', error);
      throw error;
    }
  }

  // 获取用户在桌子中的座位
  static async getUserSeat(userId, tableId) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 getUserSeat ===');
      console.log(`🔍 查找用户 ${userId} 在桌子 ${tableId} 中的座位...`);
      
      const table = await BattleTable.findByPk(tableId);
      if (!table) {
        console.log(`❌ 桌子 ${tableId} 不存在`);
        return null;
      }

      // 检查每个座位
      for (let i = 1; i <= 4; i++) {
        const seatField = `seat_${i}_user_id`;
        if (table[seatField] === userId) {
          console.log(`✅ 用户 ${userId} 在桌子 ${tableId} 座位 ${i}`);
          return i;
        }
      }
      
      console.log(`❌ 用户 ${userId} 不在桌子 ${tableId} 的任何座位中`);
      return null;
    } catch (error) {
      console.error('获取用户座位失败:', error);
      return null;
    }
  }

  // 获取用户当前所在的桌子和座位（跨桌子查找）
  static async getUserCurrentTable(userId) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 getUserCurrentTable ===');
      console.log(`🔍 查找用户 ${userId} 当前所在的桌子和座位...`);
      
      // 1. 首先获取用户状态表中的记录，确定当前正确的桌子
      const userStatus = await UserStatus.findOne({
        where: { user_id: userId }
      });
      
      console.log(`🔍 用户状态记录:`, userStatus ? userStatus.toJSON() : '无状态记录');
      
      // 2. 查找所有包含该用户的桌子
      const tables = await BattleTable.findAll({
        where: {
          [Op.or]: [
            { seat_1_user_id: userId },
            { seat_2_user_id: userId },
            { seat_3_user_id: userId },
            { seat_4_user_id: userId }
          ]
        },
        attributes: ['id', 'table_id', 'room_id', 'seat_1_user_id', 'seat_2_user_id', 'seat_3_user_id', 'seat_4_user_id']
      });
      
      console.log(`🔍 找到 ${tables.length} 张包含用户 ${userId} 的桌子`);
      
      if (tables.length === 0) {
        console.log(`❌ 用户 ${userId} 当前不在任何桌子的座位上`);
        return null;
      }
      
      // 3. 确定正确的桌子（基于user_status记录）
      let correctTable = null;
      let correctSeatNumber = null;
      
      if (userStatus && userStatus.table_id) {
        // 如果user_status中有table_id记录，优先使用这个
        correctTable = tables.find(table => table.id === userStatus.table_id);
        if (correctTable) {
          correctSeatNumber = userStatus.seat_number;
          console.log(`✅ 根据用户状态记录，用户 ${userId} 应该在桌子 ${correctTable.id} 座位 ${correctSeatNumber}`);
        } else {
          console.log(`⚠️ 用户状态记录中的桌子 ${userStatus.table_id} 不存在，需要清理状态记录`);
        }
      }
      
      // 4. 如果没有找到正确的桌子，使用第一个找到的桌子
      if (!correctTable && tables.length > 0) {
        correctTable = tables[0];
        // 确定座位号
        for (let i = 1; i <= 4; i++) {
          const seatField = `seat_${i}_user_id`;
          if (correctTable[seatField] === userId) {
            correctSeatNumber = i;
            break;
          }
        }
        console.log(`✅ 使用第一个找到的桌子: 桌子 ${correctTable.id} 座位 ${correctSeatNumber}`);
      }
      
      // 5. 清理其他错误占用的桌子
      if (tables.length > 1) {
        console.log(`🔧 发现用户 ${userId} 被错误地记录在多个桌子中，开始清理...`);
        
        for (const table of tables) {
          if (table.id !== correctTable.id) {
            console.log(`🔧 清理桌子 ${table.id} 中的错误占用...`);
            
            // 找到该桌子中用户占用的座位
            for (let i = 1; i <= 4; i++) {
              const seatField = `seat_${i}_user_id`;
              if (table[seatField] === userId) {
                console.log(`🔧 清理桌子 ${table.id} 座位 ${i} 的错误占用`);
                
                // 计算新的玩家数量
                const newCurrentPlayers = Math.max(0, table.current_players - 1);
                const newStatus = newCurrentPlayers < 2 ? 'empty' : 'waiting';
                
                // 更新桌子状态
                await table.update({
                  [seatField]: null,
                  current_players: newCurrentPlayers,
                  status: newStatus
                });
                
                console.log(`✅ 桌子 ${table.id} 座位 ${i} 清理完成，新状态: current_players=${newCurrentPlayers}, status=${newStatus}`);
                break;
              }
            }
          }
        }
      }
      
      // 6. 返回正确的桌子信息
      if (correctTable && correctSeatNumber) {
        console.log(`✅ 最终确定用户 ${userId} 在桌子 ${correctTable.id} (table_id: ${correctTable.table_id}) 座位 ${correctSeatNumber}`);
          return {
          tableId: correctTable.id,
          seatNumber: correctSeatNumber,
          roomId: correctTable.room_id,
          tableTableId: correctTable.table_id
          };
      }
      
      console.log(`❌ 无法确定用户 ${userId} 的正确座位`);
      return null;
    } catch (error) {
      console.error('获取用户当前桌子失败:', error);
      return null;
    }
  }

  // 创建游戏桌子
  static async createGameTables(roomId, gameId, tableCount = 50) {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 createGameTables ===');
      const tables = [];
      for (let i = 1; i <= tableCount; i++) {
        const table = await BattleTable.create({
          table_id: `table_${i}`,
          room_id: roomId,
          status: 'empty',
          current_players: 0,
          max_players: 4
        });
        tables.push(table);
      }
      
      console.log(`✅ 为房间 ${roomId} 创建了 ${tableCount} 张桌子`);
      return tables;
    } catch (error) {
      console.error('创建游戏桌子失败:', error);
      throw error;
    }
  }

  // 清理超时用户
  static async cleanupTimeoutUsers() {
    try {
      console.log('=== 开始执行backend=>service 目录下面的方法 cleanupTimeoutUsers ===');
      const timeoutTime = new Date(Date.now() - 3 * 60 * 1000); // 3分钟前
      
      const timeoutUsers = await UserStatus.findAll({
        where: {
          last_activity: {
            [Op.lt]: timeoutTime
          },
          status: ['waiting', 'playing']
        }
      });

      for (const userStatus of timeoutUsers) {
        if (userStatus.table_id && userStatus.seat_number) {
          await this.userLeaveTable(userStatus.user_id, userStatus.table_id, userStatus.seat_number);
        }
        if (userStatus.room_id) {
          await this.userLeaveRoom(userStatus.user_id, userStatus.room_id);
        }
      }

      return timeoutUsers.length;
    } catch (error) {
      console.error('清理超时用户失败:', error);
      return 0;
    }
  }
}

module.exports = BattleService; 
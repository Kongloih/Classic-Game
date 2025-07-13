const { BattleRoom, BattleTable, UserStatus, User, Game } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

class BattleService {
  // 获取游戏的所有房间
  static async getGameRooms(gameId) {
    try {
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

  // 用户进入房间
  static async userEnterRoom(userId, roomId) {
    try {
      const room = await BattleRoom.findByPk(roomId);
      if (!room) {
        throw new Error('房间不存在');
      }

      // 检查房间是否已满员
      if (room.online_users >= room.max_user) {
        throw new Error('房间已满员');
      }

      // 更新用户状态
      await UserStatus.upsert({
        user_id: userId,
        room_id: roomId,
        table_id: null,
        seat_number: null,
        status: 'idle',
        last_activity: new Date()
      });

      // 增加房间在线用户数
      await room.increment('online_users');
      
      // 检查房间是否满员
      if (room.online_users >= room.max_user) {
        await room.update({ status: '满员' });
      }

      return { success: true, room };
    } catch (error) {
      console.error('用户进入房间失败:', error);
      throw error;
    }
  }

  // 用户离开房间
  static async userLeaveRoom(userId, roomId) {
    try {
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
      const table = await BattleTable.findByPk(tableId);
      if (!table) {
        throw new Error('桌子不存在');
      }

      console.log(`🔧 用户 ${userId} 加入桌子 ${tableId} 座位 ${seatNumber}`);
      console.log(`📊 桌子当前状态:`, table.toJSON());

      // 检查座位是否已被占用（被其他用户占用）
      const seatField = `seat_${seatNumber}_user_id`;
      if (table[seatField] && table[seatField] !== userId) {
        throw new Error('座位已被其他用户占用');
      }

      // 检查用户是否已在其他座位（同一张桌子）
      const existingSeat = await this.getUserSeat(userId, tableId);
      let isSeatSwitch = false;
      let isTableSwitch = false;
      let oldTableInfo = null;
      
      if (existingSeat) {
        if (existingSeat === seatNumber) {
          throw new Error('用户已在该座位');
        }
        console.log(`🔄 用户 ${userId} 从座位 ${existingSeat} 切换到座位 ${seatNumber}（同一张桌子）`);
        isSeatSwitch = true;
      } else {
        // 检查用户是否在其他桌子中
        const currentTableInfo = await this.getUserCurrentTable(userId);
        if (currentTableInfo && currentTableInfo.tableId !== tableId) {
          console.log(`🔄 用户 ${userId} 从桌子 ${currentTableInfo.tableId} 座位 ${currentTableInfo.seatNumber} 切换到桌子 ${tableId} 座位 ${seatNumber}`);
          isTableSwitch = true;
          oldTableInfo = currentTableInfo;
        }
      }

      // 如果是跨桌子切换，先离开原桌子
      if (isTableSwitch && oldTableInfo) {
        console.log(`🔧 处理跨桌子切换，离开原桌子 ${oldTableInfo.tableId} 座位 ${oldTableInfo.seatNumber}`);
        
        // 释放原桌子的座位
        const oldSeatField = `seat_${oldTableInfo.seatNumber}_user_id`;
        await sequelize.query(
          `UPDATE battle_tables SET ${oldSeatField} = NULL, current_players = GREATEST(0, current_players - 1), status = CASE WHEN GREATEST(0, current_players - 1) < 2 THEN 'empty' ELSE 'waiting' END WHERE id = ?`,
          {
            replacements: [oldTableInfo.tableId],
            type: sequelize.QueryTypes.UPDATE
          }
        );
        
        console.log(`✅ 释放原桌子 ${oldTableInfo.tableId} 座位 ${oldTableInfo.seatNumber}`);
      }

      // 如果是同一张桌子内的座位切换，先释放原座位
      if (isSeatSwitch) {
        const oldSeatField = `seat_${existingSeat}_user_id`;
        
        // 使用直接SQL更新来设置NULL值
        await sequelize.query(
          `UPDATE battle_tables SET ${oldSeatField} = NULL WHERE id = ?`,
          {
            replacements: [tableId],
            type: sequelize.QueryTypes.UPDATE
          }
        );
        
        console.log(`✅ 释放原座位 ${existingSeat}`);
        
        // 重新加载桌子数据
        await table.reload();
      }

      // 占用新座位
      const updateData = {
        [seatField]: userId,
        current_players: (isSeatSwitch || isTableSwitch) ? table.current_players : table.current_players + 1,
        status: ((isSeatSwitch || isTableSwitch) ? table.current_players : table.current_players + 1) >= 2 ? 'waiting' : 'empty'
      };
      
      await table.update(updateData);
      console.log(`✅ 桌子更新成功:`, updateData);

      // 更新用户状态 - 使用upsert确保记录存在
      await UserStatus.upsert({
        user_id: userId,
        room_id: table.room_id,
        table_id: tableId,
        seat_number: seatNumber,
        status: 'waiting',
        last_activity: new Date()
      });

      console.log(`✅ 用户状态更新成功: 用户 ${userId} 在房间 ${table.room_id} 桌子 ${tableId} 座位 ${seatNumber}`);

      // 更新房间在线用户数（只在非座位切换和非跨桌子切换时增加）
      if (!isSeatSwitch && !isTableSwitch) {
        const room = await BattleRoom.findByPk(table.room_id);
        if (room) {
          await room.increment('online_users');
          console.log(`✅ 房间 ${table.room_id} 在线用户数增加`);
        }
      }

      return { 
        success: true, 
        table: table.toJSON(),
        isSeatSwitch,
        isTableSwitch,
        oldSeat: isSeatSwitch ? existingSeat : null,
        oldTableInfo: oldTableInfo
      };
    } catch (error) {
      console.error('用户加入桌子失败:', error);
      throw error;
    }
  }

  // 用户离开桌子座位
  static async userLeaveTable(userId, tableId, seatNumber) {
    try {
      const table = await BattleTable.findByPk(tableId);
      if (!table) {
        throw new Error('桌子不存在');
      }

      const seatField = `seat_${seatNumber}_user_id`;
      
      // 检查用户是否在该座位
      if (table[seatField] !== userId) {
        throw new Error('用户不在该座位');
      }

      // 释放座位 - 使用直接SQL更新
      await sequelize.query(
        `UPDATE battle_tables SET ${seatField} = NULL, current_players = ?, status = ? WHERE id = ?`,
        {
          replacements: [
            Math.max(0, table.current_players - 1),
            table.current_players - 1 < 2 ? 'empty' : 'waiting',
            tableId
          ],
          type: sequelize.QueryTypes.UPDATE
        }
      );

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
      const table = await BattleTable.findByPk(tableId);
      if (!table) return null;

      for (let i = 1; i <= 4; i++) {
        const seatField = `seat_${i}_user_id`;
        if (table[seatField] === userId) {
          return i;
        }
      }
      return null;
    } catch (error) {
      console.error('获取用户座位失败:', error);
      return null;
    }
  }

  // 获取用户当前所在的桌子和座位（跨桌子查找）
  static async getUserCurrentTable(userId) {
    try {
      // 从UserStatus表获取用户当前状态
      const userStatus = await UserStatus.findOne({
        where: { user_id: userId }
      });

      if (!userStatus || !userStatus.table_id) {
        return null;
      }

      // 检查用户是否真的在该桌子中
      const table = await BattleTable.findByPk(userStatus.table_id);
      if (!table) {
        return null;
      }

      const seatNumber = await this.getUserSeat(userId, userStatus.table_id);
      if (!seatNumber) {
        return null;
      }

      return {
        tableId: userStatus.table_id,
        seatNumber: seatNumber,
        roomId: userStatus.room_id
      };
    } catch (error) {
      console.error('获取用户当前桌子失败:', error);
      return null;
    }
  }

  // 创建游戏桌子
  static async createGameTables(roomId, gameId, tableCount = 50) {
    try {
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
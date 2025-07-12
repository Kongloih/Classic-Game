const BattleRoom = require('../models/BattleRoom');
const BattleTable = require('../models/BattleTable');
const UserStatus = require('../models/UserStatus');
const User = require('../models/User');
const { Op } = require('sequelize');

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

      // 检查座位是否已被占用
      const seatField = `seat_${seatNumber}_user_id`;
      if (table[seatField]) {
        throw new Error('座位已被占用');
      }

      // 检查用户是否已在其他座位
      const existingSeat = await this.getUserSeat(userId, tableId);
      if (existingSeat) {
        throw new Error('用户已在其他座位');
      }

      // 占用座位
      await table.update({
        [seatField]: userId,
        current_players: table.current_players + 1,
        status: table.current_players + 1 >= 2 ? 'waiting' : 'empty'
      });

      // 更新用户状态
      await UserStatus.update({
        table_id: tableId,
        seat_number: seatNumber,
        status: 'waiting',
        last_activity: new Date()
      }, {
        where: { user_id: userId }
      });

      return { success: true, table };
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

      // 释放座位
      await table.update({
        [seatField]: null,
        current_players: Math.max(0, table.current_players - 1),
        status: table.current_players - 1 < 2 ? 'empty' : 'waiting'
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
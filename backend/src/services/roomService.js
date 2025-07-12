const Room = require('../models/Room');
const RoomPlayer = require('../models/RoomPlayer');
const User = require('../models/User');
const { Op } = require('sequelize');

class RoomService {
  // 创建房间
  static async createRoom(roomData) {
    try {
      const room = await Room.create({
        roomId: roomData.roomId,
        name: roomData.name || `房间${roomData.roomId}`,
        gameId: roomData.gameId,
        creatorId: roomData.creatorId,
        maxPlayers: roomData.maxPlayers || 2,
        currentPlayers: 1,
        status: 'waiting',
        settings: roomData.settings || {}
      });

      // 添加创建者到房间
      await this.addPlayerToRoom(room.roomId, {
        userId: roomData.creatorId,
        username: roomData.creatorName,
        avatar: roomData.creatorAvatar,
        level: roomData.creatorLevel,
        isHost: true,
        isReady: false
      });

      return room;
    } catch (error) {
      console.error('创建房间失败:', error);
      throw error;
    }
  }

  // 获取房间信息
  static async getRoom(roomId) {
    try {
      const room = await Room.findOne({
        where: { roomId }
      });

      if (!room) {
        return null;
      }

      // 获取房间玩家
      const players = await RoomPlayer.findAll({
        where: { 
          roomId,
          leftAt: null // 只获取未离开的玩家
        },
        order: [['joinedAt', 'ASC']]
      });

      return {
        ...room.toJSON(),
        players
      };
    } catch (error) {
      console.error('获取房间失败:', error);
      throw error;
    }
  }

  // 添加玩家到房间
  static async addPlayerToRoom(roomId, playerData) {
    try {
      const room = await Room.findOne({ where: { roomId } });
      if (!room) {
        throw new Error('房间不存在');
      }

      if (room.currentPlayers >= room.maxPlayers) {
        throw new Error('房间已满');
      }

      // 检查玩家是否已在房间中
      const existingPlayer = await RoomPlayer.findOne({
        where: { 
          roomId, 
          userId: playerData.userId,
          leftAt: null
        }
      });

      if (existingPlayer) {
        return existingPlayer;
      }

      // 添加玩家
      const player = await RoomPlayer.create({
        roomId,
        userId: playerData.userId,
        username: playerData.username,
        avatar: playerData.avatar,
        level: playerData.level,
        isReady: playerData.isReady || false,
        isHost: playerData.isHost || false
      });

      // 更新房间玩家数量
      await room.increment('currentPlayers');

      return player;
    } catch (error) {
      console.error('添加玩家到房间失败:', error);
      throw error;
    }
  }

  // 更新玩家准备状态
  static async updatePlayerReady(roomId, userId, isReady) {
    try {
      const player = await RoomPlayer.findOne({
        where: { 
          roomId, 
          userId,
          leftAt: null
        }
      });

      if (!player) {
        throw new Error('玩家不在房间中');
      }

      await player.update({ isReady });

      // 检查是否所有玩家都准备好了
      const allPlayers = await RoomPlayer.findAll({
        where: { 
          roomId,
          leftAt: null
        }
      });

      const allReady = allPlayers.every(p => p.isReady);
      const room = await Room.findOne({ where: { roomId } });

      if (allReady && allPlayers.length >= 2) {
        await room.update({ status: 'ready' });
      } else if (room.status === 'ready') {
        await room.update({ status: 'waiting' });
      }

      return { player, allReady };
    } catch (error) {
      console.error('更新玩家准备状态失败:', error);
      throw error;
    }
  }

  // 开始游戏
  static async startGame(roomId, hostUserId) {
    try {
      const room = await Room.findOne({ where: { roomId } });
      const hostPlayer = await RoomPlayer.findOne({
        where: { 
          roomId, 
          userId: hostUserId, 
          isHost: true,
          leftAt: null
        }
      });

      if (!room || !hostPlayer) {
        throw new Error('权限不足或房间不存在');
      }

      // 检查所有玩家是否都准备好了
      const allPlayers = await RoomPlayer.findAll({ 
        where: { 
          roomId,
          leftAt: null
        }
      });
      const allReady = allPlayers.every(p => p.isReady);

      if (!allReady || allPlayers.length < 2) {
        throw new Error('玩家未全部准备或人数不足');
      }

      await room.update({
        status: 'playing',
        startTime: new Date()
      });

      return room;
    } catch (error) {
      console.error('开始游戏失败:', error);
      throw error;
    }
  }

  // 结束游戏
  static async endGame(roomId, gameResults) {
    try {
      const room = await Room.findOne({ where: { roomId } });
      if (!room) {
        throw new Error('房间不存在');
      }

      // 更新玩家游戏结果
      for (const result of gameResults) {
        await RoomPlayer.update(
          { gameResult: result.result, score: result.score },
          { where: { roomId, userId: result.userId } }
        );
      }

      await room.update({
        status: 'finished',
        endTime: new Date(),
        gameData: gameResults
      });

      return room;
    } catch (error) {
      console.error('结束游戏失败:', error);
      throw error;
    }
  }

  // 玩家离开房间
  static async leaveRoom(roomId, userId) {
    try {
      const player = await RoomPlayer.findOne({
        where: { 
          roomId, 
          userId,
          leftAt: null
        }
      });

      if (!player) {
        return false;
      }

      await player.update({ leftAt: new Date() });

      // 更新房间玩家数量
      const room = await Room.findOne({ where: { roomId } });
      await room.decrement('currentPlayers');

      // 如果房间空了，删除房间
      if (room.currentPlayers <= 1) {
        await room.destroy();
        await RoomPlayer.destroy({ where: { roomId } });
      } else if (player.isHost) {
        // 如果房主离开，转移房主权限
        const nextPlayer = await RoomPlayer.findOne({
          where: { 
            roomId, 
            leftAt: null 
          },
          order: [['joinedAt', 'ASC']]
        });
        if (nextPlayer) {
          await nextPlayer.update({ isHost: true });
        }
      }

      return true;
    } catch (error) {
      console.error('玩家离开房间失败:', error);
      throw error;
    }
  }

  // 获取房间列表
  static async getRoomList(gameId, status = 'waiting', limit = 50) {
    try {
      const rooms = await Room.findAll({
        where: { gameId, status },
        order: [['createdAt', 'DESC']],
        limit
      });

      // 为每个房间获取玩家信息
      const roomsWithPlayers = await Promise.all(
        rooms.map(async (room) => {
          const players = await RoomPlayer.findAll({
            where: { 
              roomId: room.roomId,
              leftAt: null
            },
            order: [['joinedAt', 'ASC']]
          });

          return {
            ...room.toJSON(),
            players
          };
        })
      );

      return roomsWithPlayers;
    } catch (error) {
      console.error('获取房间列表失败:', error);
      throw error;
    }
  }

  // 清理过期房间
  static async cleanupExpiredRooms() {
    try {
      const expiredTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时前
      
      const expiredRooms = await Room.findAll({
        where: {
          status: 'waiting',
          createdAt: {
            [Op.lt]: expiredTime
          }
        }
      });

      for (const room of expiredRooms) {
        await this.leaveRoom(room.roomId, room.creatorId);
      }

      console.log(`清理了 ${expiredRooms.length} 个过期房间`);
    } catch (error) {
      console.error('清理过期房间失败:', error);
    }
  }
}

module.exports = RoomService; 
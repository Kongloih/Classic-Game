const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const BattleRoom = require('../models/BattleRoom');
const BattleTable = require('../models/BattleTable');
const UserStatus = require('../models/UserStatus');
const Game = require('../models/Game');

// 获取游戏大厅数据
router.get('/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { testMode } = req.query;

    // 获取游戏信息
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({ message: '游戏不存在' });
    }

    // 获取该游戏的所有房间
    const rooms = await BattleRoom.findAll({
      where: { game_id: gameId },
      order: [['room_id', 'ASC']]
    });

    // 获取所有房间的桌子数据
    const roomIds = rooms.map(room => room.id);
    const tables = await BattleTable.findAll({
      where: { room_id: roomIds },
      order: [['table_id', 'ASC']]
    });

    // 获取用户状态
    const userStatus = await UserStatus.findOne({
      where: { user_id: req.user.id }
    });

    // 组织返回数据
    const gameHallData = {
      game: {
        id: game.id,
        name: game.name,
        name_en: game.name_en,
        category: game.category,
        max_players: game.max_players,
        supports_online: game.supports_online
      },
      rooms: rooms.map(room => ({
        id: room.id,
        room_id: room.room_id,
        name: room.name,
        status: room.status,
        online_users: room.online_users,
        max_user: room.max_user,
        current_tables: room.current_tables,
        max_tables: room.max_tables
      })),
      tables: tables.map(table => ({
        id: table.id,
        table_id: table.table_id,
        room_id: table.room_id,
        status: table.status,
        current_players: table.current_players,
        max_players: table.max_players,
        seats: {
          1: table.seat_1_user_id,
          2: table.seat_2_user_id,
          3: table.seat_3_user_id,
          4: table.seat_4_user_id
        }
      })),
      userStatus: userStatus ? {
        room_id: userStatus.room_id,
        table_id: userStatus.table_id,
        seat_number: userStatus.seat_number,
        status: userStatus.status
      } : null
    };

    res.json({
      success: true,
      data: gameHallData
    });

  } catch (error) {
    console.error('获取游戏大厅数据失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取游戏大厅数据失败',
      error: error.message 
    });
  }
});

// 加入桌子座位
router.post('/tables/:tableId/join', authMiddleware, async (req, res) => {
  try {
    const { tableId } = req.params;
    const { seatNumber } = req.body;
    const userId = req.user.id;

    // 验证座位号
    if (!seatNumber || seatNumber < 1 || seatNumber > 4) {
      return res.status(400).json({ 
        success: false, 
        message: '无效的座位号' 
      });
    }

    // 获取桌子信息
    const table = await BattleTable.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: '桌子不存在' 
      });
    }

    // 检查桌子状态
    if (table.status === 'playing') {
      return res.status(400).json({ 
        success: false, 
        message: '桌子正在游戏中' 
      });
    }

    // 检查座位是否已被占用
    const seatField = `seat_${seatNumber}_user_id`;
    if (table[seatField]) {
      return res.status(400).json({ 
        success: false, 
        message: `座位${seatNumber}已被占用` 
      });
    }

    // 检查用户是否已在其他座位
    const existingSeat = await BattleTable.findOne({
      where: {
        [seatField]: userId
      }
    });

    if (existingSeat) {
      return res.status(400).json({ 
        success: false, 
        message: '您已在其他座位' 
      });
    }

    // 更新桌子座位
    await table.update({
      [seatField]: userId,
      current_players: table.current_players + 1,
      status: table.current_players + 1 >= 2 ? 'waiting' : 'empty'
    });

    // 更新用户状态
    await UserStatus.upsert({
      user_id: userId,
      room_id: table.room_id,
      table_id: table.id,
      seat_number: seatNumber,
      status: 'waiting',
      last_activity: new Date()
    });

    // 更新房间在线用户数
    const room = await BattleRoom.findByPk(table.room_id);
    if (room) {
      await room.update({
        online_users: room.online_users + 1
      });
    }

    res.json({
      success: true,
      message: `成功加入座位${seatNumber}`,
      data: {
        table_id: table.id,
        seat_number: seatNumber,
        current_players: table.current_players + 1
      }
    });

  } catch (error) {
    console.error('加入座位失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '加入座位失败',
      error: error.message 
    });
  }
});

// 离开桌子座位
router.post('/tables/:tableId/leave', authMiddleware, async (req, res) => {
  try {
    const { tableId } = req.params;
    const userId = req.user.id;

    // 获取桌子信息
    const table = await BattleTable.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ 
        success: false, 
        message: '桌子不存在' 
      });
    }

    // 找到用户所在的座位
    let seatNumber = null;
    let seatField = null;

    for (let i = 1; i <= 4; i++) {
      const field = `seat_${i}_user_id`;
      if (table[field] === userId) {
        seatNumber = i;
        seatField = field;
        break;
      }
    }

    if (!seatNumber) {
      return res.status(400).json({ 
        success: false, 
        message: '您不在此桌子' 
      });
    }

    // 更新桌子座位
    await table.update({
      [seatField]: null,
      current_players: Math.max(0, table.current_players - 1),
      status: table.current_players - 1 === 0 ? 'empty' : 'waiting'
    });

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

    // 更新房间在线用户数
    const room = await BattleRoom.findByPk(table.room_id);
    if (room) {
      await room.update({
        online_users: Math.max(0, room.online_users - 1)
      });
    }

    res.json({
      success: true,
      message: '成功离开座位',
      data: {
        table_id: table.id,
        seat_number: seatNumber,
        current_players: Math.max(0, table.current_players - 1)
      }
    });

  } catch (error) {
    console.error('离开座位失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '离开座位失败',
      error: error.message 
    });
  }
});

// 获取用户状态
router.get('/user/status', authMiddleware, async (req, res) => {
  try {
    const userStatus = await UserStatus.findOne({
      where: { user_id: req.user.id }
    });

    res.json({
      success: true,
      data: userStatus ? {
        room_id: userStatus.room_id,
        table_id: userStatus.table_id,
        seat_number: userStatus.seat_number,
        status: userStatus.status,
        last_activity: userStatus.last_activity
      } : null
    });

  } catch (error) {
    console.error('获取用户状态失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取用户状态失败',
      error: error.message 
    });
  }
});

module.exports = router; 
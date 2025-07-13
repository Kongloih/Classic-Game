const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const BattleService = require('../services/battleService');
const UserStatus = require('../models/UserStatus');
const BattleRoom = require('../models/BattleRoom');

// 获取游戏的所有房间
router.get('/rooms/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const rooms = await BattleService.getGameRooms(gameId);
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('获取游戏房间失败:', error);
    res.status(500).json({
      success: false,
      message: '获取房间列表失败'
    });
  }
});

// 获取房间内的所有桌子
router.get('/tables/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    console.log(`🔧 获取房间 ${roomId} 的桌子数据`);
    
    // 首先尝试通过主键ID查找房间
    let room = await BattleRoom.findByPk(roomId);
    
    // 如果找不到，尝试通过room_id字段查找
    if (!room) {
      room = await BattleRoom.findOne({
        where: { room_id: roomId }
      });
    }
    
    if (!room) {
      console.log(`❌ 房间 ${roomId} 不存在`);
      return res.status(404).json({
        success: false,
        message: '房间不存在'
      });
    }
    
    console.log(`✅ 找到房间: ${room.name} (ID: ${room.id}, room_id: ${room.room_id})`);
    
    // 使用房间的主键ID获取桌子
    const tables = await BattleService.getRoomTables(room.id);
    
    res.json({
      success: true,
      data: tables
    });
  } catch (error) {
    console.error('获取房间桌子失败:', error);
    res.status(500).json({
      success: false,
      message: '获取桌子列表失败'
    });
  }
});

// 用户进入房间
router.post('/rooms/:roomId/enter', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    const result = await BattleService.userEnterRoom(userId, roomId);
    
    res.json({
      success: true,
      data: result,
      message: '成功进入房间'
    });
  } catch (error) {
    console.error('进入房间失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '进入房间失败'
    });
  }
});

// 用户离开房间
router.post('/rooms/:roomId/leave', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;
    
    const result = await BattleService.userLeaveRoom(userId, roomId);
    
    res.json({
      success: true,
      data: result,
      message: '成功离开房间'
    });
  } catch (error) {
    console.error('离开房间失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '离开房间失败'
    });
  }
});

// 用户加入桌子座位
router.post('/tables/:tableId/join', authMiddleware, async (req, res) => {
  try {
    const { tableId } = req.params;
    const { seatNumber } = req.body;
    const userId = req.user.id;
    
    if (!seatNumber || seatNumber < 1 || seatNumber > 4) {
      return res.status(400).json({
        success: false,
        message: '座位号无效'
      });
    }
    
    const result = await BattleService.userJoinTable(userId, tableId, seatNumber);
    
    res.json({
      success: true,
      data: result,
      message: '成功加入座位'
    });
  } catch (error) {
    console.error('加入座位失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '加入座位失败'
    });
  }
});

// 用户离开桌子座位
router.post('/tables/:tableId/leave', authMiddleware, async (req, res) => {
  try {
    const { tableId } = req.params;
    const userId = req.user.id;
    
    // 获取用户当前座位
    const seatNumber = await BattleService.getUserSeat(userId, tableId);
    if (!seatNumber) {
      return res.status(400).json({
        success: false,
        message: '用户不在该桌子中'
      });
    }
    
    const result = await BattleService.userLeaveTable(userId, tableId, seatNumber);
    
    res.json({
      success: true,
      data: result,
      message: '成功离开座位'
    });
  } catch (error) {
    console.error('离开座位失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '离开座位失败'
    });
  }
});

// 开始游戏
router.post('/tables/:tableId/start', authMiddleware, async (req, res) => {
  try {
    const { tableId } = req.params;
    const userId = req.user.id;
    
    // TODO: 实现开始游戏逻辑
    // 检查所有玩家是否准备就绪
    // 设置游戏状态为playing
    // 分配游戏房间等
    
    res.json({
      success: true,
      message: '游戏开始'
    });
  } catch (error) {
    console.error('开始游戏失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '开始游戏失败'
    });
  }
});

// 获取用户状态
router.get('/user/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userStatus = await UserStatus.findOne({
      where: { user_id: userId }
    });
    
    res.json({
      success: true,
      data: userStatus
    });
  } catch (error) {
    console.error('获取用户状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户状态失败'
    });
  }
});

module.exports = router;
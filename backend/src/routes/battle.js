const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// 获取对战房间列表
router.get('/rooms', authMiddleware, async (req, res) => {
  try {
    const rooms = [
      {
        id: 1,
        name: '俄罗斯方块对战房',
        game: '俄罗斯方块',
        players: 2,
        maxPlayers: 4,
        status: 'waiting',
        createdBy: '用户1'
      },
      {
        id: 2,
        name: '贪吃蛇竞技场',
        game: '贪吃蛇',
        players: 3,
        maxPlayers: 6,
        status: 'playing',
        createdBy: '用户2'
      }
    ];
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取对战房间失败'
    });
  }
});

// 创建对战房间
router.post('/rooms', authMiddleware, async (req, res) => {
  try {
    const { name, game, maxPlayers } = req.body;
    
    const room = {
      id: Date.now(),
      name: name,
      game: game,
      players: 1,
      maxPlayers: maxPlayers || 4,
      status: 'waiting',
      createdBy: req.user.username,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: room,
      message: '房间创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建房间失败'
    });
  }
});

// 加入对战房间
router.post('/rooms/:roomId/join', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    res.json({
      success: true,
      message: '成功加入房间'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '加入房间失败'
    });
  }
});

// 获取房间详情
router.get('/rooms/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = {
      id: roomId,
      name: '俄罗斯方块对战房',
      game: '俄罗斯方块',
      players: [
        {
          id: 1,
          username: '玩家1',
          ready: true,
          score: 0
        },
        {
          id: 2,
          username: '玩家2',
          ready: false,
          score: 0
        }
      ],
      maxPlayers: 4,
      status: 'waiting',
      gameSettings: {
        difficulty: 'normal',
        timeLimit: 300
      }
    };
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取房间详情失败'
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// 获取游戏列表
router.get('/', async (req, res) => {
  try {
    const games = [
      {
        id: 1,
        title: '俄罗斯方块',
        description: '经典的方块消除游戏',
        category: 'puzzle',
        difficulty: 'easy',
        players: 1234,
        rating: 4.8,
        image: '/api/games/1/image'
      },
      {
        id: 2,
        title: '贪吃蛇',
        description: '控制蛇吃食物成长',
        category: 'arcade',
        difficulty: 'easy',
        players: 856,
        rating: 4.5,
        image: '/api/games/2/image'
      },
      {
        id: 3,
        title: '扫雷',
        description: '经典的逻辑推理游戏',
        category: 'puzzle',
        difficulty: 'medium',
        players: 567,
        rating: 4.7,
        image: '/api/games/3/image'
      }
    ];
    
    res.json({
      success: true,
      data: games
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取游戏列表失败'
    });
  }
});

// 获取游戏详情
router.get('/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    
    // 模拟游戏详情
    const game = {
      id: gameId,
      title: '俄罗斯方块',
      description: '俄罗斯方块是一款经典的益智游戏，玩家需要控制不同形状的方块，使其在底部形成完整的横行。',
      category: 'puzzle',
      difficulty: 'easy',
      players: 1234,
      rating: 4.8,
      instructions: [
        '使用方向键控制方块移动',
        '空格键快速下落',
        'Shift键旋转方块'
      ],
      features: [
        '经典俄罗斯方块玩法',
        '多种难度级别',
        '实时排行榜'
      ]
    };
    
    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取游戏详情失败'
    });
  }
});

// 开始游戏
router.post('/:id/start', authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id;
    
    // 模拟开始游戏
    const gameSession = {
      id: Date.now(),
      gameId: gameId,
      userId: req.user.id,
      status: 'playing',
      startTime: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: gameSession,
      message: '游戏开始'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '开始游戏失败'
    });
  }
});

// 保存游戏分数
router.post('/:id/score', authMiddleware, async (req, res) => {
  try {
    const { score, level, time } = req.body;
    const gameId = req.params.id;
    
    // 模拟保存分数
    const gameRecord = {
      id: Date.now(),
      gameId: gameId,
      userId: req.user.id,
      score: score,
      level: level,
      time: time,
      date: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: gameRecord,
      message: '分数保存成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '保存分数失败'
    });
  }
});

module.exports = router; 
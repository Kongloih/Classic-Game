const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Game = require('../models/Game');

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

// 获取游戏大厅数据
router.get('/hall/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { page = 1, limit = 50, status } = req.query;
    
    // 获取在线用户数量
    const onlineUsersCount = await User.count({
      where: {
        status: 'active',
        last_login_at: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // 5分钟内活跃
        }
      }
    });

    // 获取活跃房间数量（这里可以根据实际需求调整逻辑）
    const activeRoomsCount = Math.floor(Math.random() * 20) + 10; // 临时模拟数据

    // 获取游戏信息
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }

    // 获取游戏桌数据（这里需要根据实际的房间表来实现）
    // 暂时返回模拟数据，后续可以连接真实的房间表
    const gameTables = [];
    for (let i = 1; i <= 50; i++) {
      const isFull = Math.random() > 0.6;
      const players = [];
      
      if (isFull) {
        // 获取真实的在线用户作为玩家
        const onlineUsers = await User.findAll({
          where: {
            status: 'active',
            last_login_at: {
              [require('sequelize').Op.gte]: new Date(Date.now() - 10 * 60 * 1000)
            }
          },
          limit: 2,
          order: require('sequelize').literal('RAND()')
        });

        onlineUsers.forEach((user, index) => {
          players.push({
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            score: Math.floor(Math.random() * 10000),
            isReady: true,
          });
        });
      } else if (Math.random() > 0.5) {
        const onlineUser = await User.findOne({
          where: {
            status: 'active',
            last_login_at: {
              [require('sequelize').Op.gte]: new Date(Date.now() - 10 * 60 * 1000)
            }
          },
          order: require('sequelize').literal('RAND()')
        });

        if (onlineUser) {
          players.push({
            id: onlineUser.id,
            username: onlineUser.username,
            avatar: onlineUser.avatar,
            score: Math.floor(Math.random() * 10000),
            isReady: true,
          });
        }
      }

      gameTables.push({
        id: i,
        players,
        status: isFull ? 'full' : players.length > 0 ? 'waiting' : 'empty',
        gameType: game.name,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        maxScore: Math.floor(Math.random() * 50000),
      });
    }

    res.json({
      success: true,
      data: {
        game,
        gameTables,
        stats: {
          onlineUsers: onlineUsersCount,
          activeRooms: activeRoomsCount,
          maxScore: Math.max(...gameTables.map(t => t.maxScore))
        }
      }
    });

  } catch (error) {
    console.error('获取游戏大厅数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取在线用户列表
router.get('/online-users', authMiddleware, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const onlineUsers = await User.findAll({
      where: {
        status: 'active',
        last_login_at: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 10 * 60 * 1000) // 10分钟内活跃
        }
      },
      attributes: ['id', 'username', 'avatar', 'level', 'last_login_at'],
      order: [['last_login_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: onlineUsers
    });

  } catch (error) {
    console.error('获取在线用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// 获取用户游戏统计
router.get('/stats/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'username', 'avatar', 'level', 'experience', 'coins', 'diamonds',
        'total_games', 'total_wins', 'total_losses', 'total_draws', 'highest_score'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Game = require('../models/Game');

// 获取游戏列表 (公开访问)
router.get('/', async (req, res) => {
  try {
    const { category, featured, hot, limit = 50 } = req.query;
    const where = { status: 'active' };
    
    if (category) where.category = category;
    if (featured === 'true') where.is_featured = true;
    if (hot === 'true') where.is_hot = true;
    
    const games = await Game.findAll({
      where,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error('获取游戏列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取游戏列表失败'
    });
  }
});

// 获取在线用户列表 (移到前面)
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

    // 获取游戏信息
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }

    // 获取真实的房间数据
    const RoomService = require('../services/roomService');
    const realRooms = await RoomService.getRoomList(gameId, 'waiting', 50);
    
    // 转换为游戏桌格式
    const gameTables = realRooms.map((room, index) => {
      const players = room.players || [];
      let status = 'empty';
      
      if (players.length >= room.maxPlayers) {
        status = 'full';
      } else if (players.length > 0) {
        status = 'waiting';
      }
      
      return {
        id: room.roomId, // 使用数据库中的roomId字段
        players: players.map(p => ({
          id: p.userId,
          username: p.username,
          avatar: p.avatar,
          score: p.score || 0,
          isReady: p.isReady,
          level: p.level
        })),
        status,
        gameType: game.name,
        createdAt: room.createdAt,
        maxScore: Math.max(...players.map(p => p.score || 0), 0),
      };
    });

    // 如果真实房间数量不足，添加一些空房间
    const emptyRoomsNeeded = Math.max(0, 20 - gameTables.length);
    for (let i = 1; i <= emptyRoomsNeeded; i++) {
      gameTables.push({
        id: `${gameId}_${i}`, // 使用正确的格式：gameId_roomNumber
        players: [],
        status: 'empty',
        gameType: game.name,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        maxScore: 0,
      });
    }

    res.json({
      success: true,
      data: {
        game,
        gameTables,
        stats: {
          onlineUsers: onlineUsersCount,
          activeRooms: realRooms.length,
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

// 获取用户游戏统计 (移到前面)
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

// 获取游戏详情 (公开访问) - 移到后面以避免路由冲突
router.get('/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }
    
    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('获取游戏详情错误:', error);
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
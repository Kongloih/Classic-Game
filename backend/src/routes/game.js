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

// 获取游戏大厅数据 (移到前面)
router.get('/hall/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { page = 1, limit = 50, status, testMode } = req.query;
    
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
    const activeRoomsCount = 0; // 测试模式下为0

    // 获取游戏信息
    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: '游戏不存在'
      });
    }

    // 开发环境下测试模式或无用户时只生成空房间
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if ((testMode === 'true' || onlineUsersCount === 0) && isDevelopment) {
      console.log('🔧 开发模式：生成测试房间数据');
      const testGameTables = [];
      for (let i = 1; i <= 20; i++) {
        testGameTables.push({
          id: i,
          players: [],
          status: 'empty',
          gameType: game.name,
          createdAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
          maxScore: 0,
        });
      }
      return res.json({
        success: true,
        data: {
          game,
          gameTables: testGameTables,
          stats: {
            onlineUsers: 0,
            activeRooms: 0,
            maxScore: 0
          }
        }
      });
    }

    // 生产环境或非测试模式：需要真实用户数据
    console.log('🚀 生产模式：使用真实用户数据');
    
    // 获取游戏桌数据（这里需要根据实际的房间表来实现）
    // 暂时返回模拟数据，后续可以连接真实的房间表
    const gameTables = [];
    
    // 获取真实的在线用户数量
    const realOnlineUsers = await User.count({
      where: {
        status: 'active',
        last_login_at: {
          [require('sequelize').Op.gte]: new Date(Date.now() - 10 * 60 * 1000)
        }
      }
    });
    
    // 根据真实在线用户数量生成合理的房间状态
    for (let i = 1; i <= 50; i++) {
      let status = 'empty';
      let players = [];
      
      // 如果真实在线用户很少或没有，大部分房间应该是空的
      if (realOnlineUsers === 0) {
        // 没有真实用户时，只创建少量空房间和等待房间
        if (i <= 5) {
          status = 'empty';
        } else if (i <= 8) {
          status = 'waiting';
          // 添加一个模拟的等待用户
          players.push({
            id: `waiting_user_${i}`,
            username: `等待玩家${i}`,
            avatar: null,
            score: 0,
            isReady: false,
          });
        } else {
          // 其余房间为空
          status = 'empty';
        }
      } else {
        // 有真实用户时，根据用户数量合理分配房间状态
        const onlineUsers = await User.findAll({
          where: {
            status: 'active',
            last_login_at: {
              [require('sequelize').Op.gte]: new Date(Date.now() - 10 * 60 * 1000)
            }
          },
          limit: 10,
          order: [['last_login_at', 'DESC']]
        });
        
        if (onlineUsers.length > 0) {
          // 根据房间ID和用户数量决定房间状态
          if (i <= Math.min(onlineUsers.length, 5)) {
            // 前几个房间有真实用户
            const userIndex = (i - 1) % onlineUsers.length;
            const user = onlineUsers[userIndex];
            players.push({
              id: user.id,
              username: user.username,
              avatar: user.avatar,
              score: Math.floor(Math.random() * 10000),
              isReady: true,
            });
            status = 'waiting';
          } else if (i <= Math.min(onlineUsers.length + 3, 10)) {
            // 少量房间显示为满（需要2个用户）
            if (onlineUsers.length >= 2) {
              const user1 = onlineUsers[0];
              const user2 = onlineUsers[1];
              players.push(
                {
                  id: user1.id,
                  username: user1.username,
                  avatar: user1.avatar,
                  score: Math.floor(Math.random() * 10000),
                  isReady: true,
                },
                {
                  id: user2.id,
                  username: user2.username,
                  avatar: user2.avatar,
                  score: Math.floor(Math.random() * 10000),
                  isReady: true,
                }
              );
              status = 'full';
            } else {
              status = 'waiting';
              players.push({
                id: onlineUsers[0].id,
                username: onlineUsers[0].username,
                avatar: onlineUsers[0].avatar,
                score: Math.floor(Math.random() * 10000),
                isReady: true,
              });
            }
          } else {
            // 其余房间为空
            status = 'empty';
          }
        } else {
          // 没有在线用户时，所有房间都为空
          status = 'empty';
        }
      }

      gameTables.push({
        id: i,
        players,
        status,
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
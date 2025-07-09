const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// 获取好友列表
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const friends = [
      {
        id: 1,
        username: '好友1',
        avatar: null,
        online: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: 2,
        username: '好友2',
        avatar: null,
        online: false,
        lastSeen: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: friends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取好友列表失败'
    });
  }
});

// 发送好友请求
router.post('/friends/request', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    
    res.json({
      success: true,
      message: '好友请求已发送'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '发送好友请求失败'
    });
  }
});

// 获取公会列表
router.get('/guilds', authMiddleware, async (req, res) => {
  try {
    const guilds = [
      {
        id: 1,
        name: '经典游戏公会',
        description: '热爱经典游戏的玩家聚集地',
        memberCount: 50,
        level: 5
      }
    ];
    
    res.json({
      success: true,
      data: guilds
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取公会列表失败'
    });
  }
});

// 获取聊天记录
router.get('/chat/:roomId', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const messages = [
      {
        id: 1,
        userId: 1,
        username: '用户1',
        message: '大家好！',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        userId: 2,
        username: '用户2',
        message: '你好！',
        timestamp: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取聊天记录失败'
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// 获取用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // 模拟用户数据
    const user = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      avatar: req.user.avatar,
      level: 1,
      experience: 0,
      joinDate: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    
    // 模拟更新用户信息
    const updatedUser = {
      id: req.user.id,
      username: username || req.user.username,
      email: email || req.user.email,
      avatar: avatar || req.user.avatar
    };
    
    res.json({
      success: true,
      data: updatedUser,
      message: '用户信息更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

// 获取用户设置
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const settings = {
      notifications: {
        email: true,
        push: true,
        gameInvites: true
      },
      privacy: {
        showOnlineStatus: true,
        allowFriendRequests: true
      },
      theme: 'light'
    };
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取用户设置失败'
    });
  }
});

// 更新用户设置
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const settings = req.body;
    
    res.json({
      success: true,
      message: '设置更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新设置失败'
    });
  }
});

module.exports = router;
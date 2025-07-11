const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { RedisHelper } = require('../config/redis');
const { authMiddleware } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const smsService = require('../services/smsService');
const crypto = require('crypto');

const router = express.Router();

/**
 * @swagger
 * /api/auth/send-sms:
 *   post:
 *     summary: 发送短信验证码
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - type
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^1[3-9]\\d{9}$'
 *               type:
 *                 type: string
 *                 enum: [register, login, reset]
 *     responses:
 *       200:
 *         description: 发送成功
 *       400:
 *         description: 请求参数错误
 *       429:
 *         description: 发送过于频繁
 */
router.post('/send-sms', [
  body('phone')
    .matches(/^(\+86)?1[3-9]\d{9}$/)
    .withMessage('请输入正确的手机号'),
  body('type')
    .isIn(['register', 'login', 'reset'])
    .withMessage('验证码类型不正确')
], async (req, res) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误',
        errors: errors.array()
      });
    }

    const { phone, type } = req.body;

    // 发送短信验证码
    const result = await smsService.sendVerificationCode(phone, type);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('发送短信验证码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - nickname
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 128
 *               nickname:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: 注册成功
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 用户名或邮箱已存在
 */
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('phone')
    .matches(/^(\+86)?1[3-9]\d{9}$/)
    .withMessage('请输入正确的手机号'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('密码长度必须在6-128个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  body('verificationCode')
    .isLength({ min: 6, max: 6 })
    .withMessage('验证码为6位数字')
    .isNumeric()
    .withMessage('验证码只能包含数字'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('性别选择不正确'),
  body('birthYear')
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('出生年份不正确')
], async (req, res) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误',
        errors: errors.array()
      });
    }

    const { username, phone, email, password, verificationCode, gender, birthYear } = req.body;

    // 验证短信验证码
    const isCodeValid = await smsService.verifyCode(phone, verificationCode, 'register');
    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: '验证码错误或已过期'
      });
    }

    // 检查用户名、手机号和邮箱是否已存在
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { username },
          { phone },
          { email }
        ]
      }
    });

    if (existingUser) {
      let field = '用户名';
      if (existingUser.username === username) field = '用户名';
      else if (existingUser.phone === phone) field = '手机号';
      else if (existingUser.email === email) field = '邮箱';
      
      return res.status(409).json({
        success: false,
        message: `${field}已被使用`
      });
    }

    // 生成邮箱验证令牌
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 创建用户
    const user = await User.create({
      username,
      phone,
      email,
      password,
      nickname: username, // 使用用户名作为默认昵称
      gender,
      birth_year: birthYear,
      verification_token: verificationToken,
      is_verified: true // 手机号验证后直接设为已验证
    });

    // 发送验证邮件
    try {
      await sendEmail({
        to: email,
        subject: '欢迎加入经典街机游戏平台 - 请验证您的邮箱',
        template: 'verification',
        data: {
          nickname: username, // 使用 username 作为 nickname
          verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
        }
      });
    } catch (emailError) {
      console.error('发送验证邮件失败:', emailError);
      // 邮件发送失败不影响注册流程
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 生成刷新令牌
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    // 将刷新令牌存储到Redis
    await RedisHelper.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 3600);

    res.status(201).json({
      success: true,
      message: '注册成功！',
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: 用户名或邮箱
 *               password:
 *                 type: string
 *               remember_me:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: 登录成功
 *       401:
 *         description: 认证失败
 *       403:
 *         description: 账户被禁用
 */
router.post('/login', [
  body('identifier')
    .notEmpty()
    .withMessage('请输入用户名或邮箱'),
  body('password')
    .notEmpty()
    .withMessage('请输入密码')
], async (req, res) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误',
        errors: errors.array()
      });
    }

    const { identifier, password, remember_me = false } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // 查找用户
    const user = await User.findByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码错误'
      });
    }

    // 检查账户状态
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: '账户已被禁用，请联系客服'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: '账户未激活，请先验证邮箱'
      });
    }

    // 验证密码
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名/邮箱或密码错误'
      });
    }

    // 更新登录信息
    await user.updateLoginInfo(clientIp);

    // 生成JWT令牌
    const tokenExpiry = remember_me ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // 生成刷新令牌
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    // 将刷新令牌存储到Redis
    const refreshTokenExpiry = remember_me ? 90 * 24 * 3600 : 30 * 24 * 3600; // 90天或30天
    await RedisHelper.set(`refresh_token:${user.id}`, refreshToken, refreshTokenExpiry);

    // 记录用户在线状态
    await RedisHelper.set(`user_online:${user.id}`, {
      login_time: new Date().toISOString(),
      ip: clientIp
    }, 24 * 3600);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: user.toJSON(),
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: 用户登出
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 删除刷新令牌
    await RedisHelper.del(`refresh_token:${userId}`);
    
    // 删除在线状态
    await RedisHelper.del(`user_online:${userId}`);

    // 将当前token加入黑名单
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.decode(token);
      const expiry = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiry > 0) {
        await RedisHelper.set(`blacklist_token:${token}`, true, expiry);
      }
    }

    res.json({
      success: true,
      message: '登出成功'
    });

  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: 刷新访问令牌
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 刷新成功
 *       401:
 *         description: 刷新令牌无效
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: '缺少刷新令牌'
      });
    }

    // 验证刷新令牌
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: '无效的刷新令牌'
      });
    }

    // 检查Redis中的刷新令牌
    const storedToken = await RedisHelper.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: '刷新令牌已过期或无效'
      });
    }

    // 获取用户信息
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '用户不存在或账户异常'
      });
    }

    // 生成新的访问令牌
    const newToken = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        token: newToken,
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(401).json({
      success: false,
      message: '刷新令牌无效或已过期'
    });
  }
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: 验证邮箱
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: 邮箱验证成功
 *       400:
 *         description: 验证令牌无效
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: '缺少验证令牌'
      });
    }

    const user = await User.findOne({
      where: { verification_token: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '验证令牌无效或已过期'
      });
    }

    // 更新用户验证状态
    user.is_verified = true;
    user.verification_token = null;
    user.status = 'active';
    await user.save();

    res.json({
      success: true,
      message: '邮箱验证成功'
    });

  } catch (error) {
    console.error('邮箱验证错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: 忘记密码
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: 重置邮件已发送
 *       404:
 *         description: 邮箱不存在
 */
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '该邮箱未注册'
      });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1小时后过期

    user.reset_password_token = resetToken;
    user.reset_password_expires = resetExpires;
    await user.save();

    // 发送重置邮件
    try {
      await sendEmail({
        to: email,
        subject: '密码重置 - 经典街机游戏平台',
        template: 'reset-password',
        data: {
          nickname: user.nickname,
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });

      res.json({
        success: true,
        message: '密码重置邮件已发送，请查看邮箱'
      });

    } catch (emailError) {
      console.error('发送重置邮件失败:', emailError);
      res.status(500).json({
        success: false,
        message: '发送邮件失败，请稍后重试'
      });
    }

  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 重置密码
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: 密码重置成功
 *       400:
 *         description: 重置令牌无效或已过期
 */
router.post('/reset-password', [
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('密码长度必须在6-128个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '请求参数错误',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [User.sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: '重置令牌无效或已过期'
      });
    }

    // 更新密码
    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    res.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    });

  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * @swagger
 * /api/auth/status:
 *   get:
 *     summary: 获取用户状态
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未认证
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('获取用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router; 
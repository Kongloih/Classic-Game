const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { RedisHelper } = require('../config/redis');

/**
 * JWT认证中间件
 * 验证请求头中的Bearer token
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '缺少访问令牌'
      });
    }

    const token = authHeader.split(' ')[1];

    // 检查token是否在黑名单中
    const isBlacklisted = await RedisHelper.exists(`blacklist_token:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: '令牌已失效'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 获取用户信息
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账户异常，请联系客服'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '访问令牌已过期'
      });
    }

    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 可选认证中间件
 * 如果有token则验证，没有token则跳过
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // 检查token是否在黑名单中
    const isBlacklisted = await RedisHelper.exists(`blacklist_token:${token}`);
    if (isBlacklisted) {
      return next();
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 获取用户信息
    const user = await User.findByPk(decoded.userId);
    if (user && user.status === 'active') {
      req.user = user;
      req.token = token;
    }

    next();

  } catch (error) {
    // 可选认证失败时不返回错误，继续执行
    next();
  }
};

/**
 * 管理员认证中间件
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // 先执行基本认证
    await new Promise((resolve, reject) => {
      authMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // 检查是否为管理员
    if (!req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }

    next();

  } catch (error) {
    // 如果是认证错误，直接返回
    if (error.status) {
      return res.status(error.status).json(error);
    }

    console.error('管理员认证错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 角色验证中间件工厂
 * @param {string|array} roles - 允许的角色
 */
const roleMiddleware = (roles) => {
  return async (req, res, next) => {
    try {
      // 先执行基本认证
      await new Promise((resolve, reject) => {
        authMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const userRoles = req.user.roles || [];
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      const hasPermission = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: '权限不足'
        });
      }

      next();

    } catch (error) {
      if (error.status) {
        return res.status(error.status).json(error);
      }

      console.error('角色验证错误:', error);
      return res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
};

/**
 * API密钥认证中间件（用于内部服务调用）
 */
const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({
      success: false,
      message: '无效的API密钥'
    });
  }

  next();
};

/**
 * 速率限制中间件
 * @param {number} maxRequests - 最大请求次数
 * @param {number} windowMs - 时间窗口（毫秒）
 */
const rateLimitMiddleware = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return async (req, res, next) => {
    try {
      const identifier = req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
      const key = `rate_limit:${identifier}`;
      
      const current = await RedisHelper.get(key) || 0;
      
      if (current >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: '请求过于频繁，请稍后再试'
        });
      }

      const newCount = current + 1;
      const expiry = Math.ceil(windowMs / 1000);
      
      await RedisHelper.set(key, newCount, expiry);

      // 设置响应头
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - newCount),
        'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
      });

      next();

    } catch (error) {
      console.error('速率限制错误:', error);
      // 速率限制失败时允许请求通过
      next();
    }
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminMiddleware,
  roleMiddleware,
  apiKeyMiddleware,
  rateLimitMiddleware
}; 
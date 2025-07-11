const redis = require('redis');
require('dotenv').config();

// Redis配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  // 暂时不使用密码认证，避免连接错误
  // ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // 如果Redis服务器拒绝连接，返回错误
      return new Error('Redis服务器拒绝连接');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // 重试时间超过1小时，停止重试
      return new Error('Redis重试时间超过限制');
    }
    if (options.attempt > 10) {
      // 重试次数超过10次，停止重试
      return undefined;
    }
    // 重试延迟
    return Math.min(options.attempt * 100, 3000);
  }
};

// 创建Redis客户端
let redisClient = null;

// 连接Redis
const connectRedis = async () => {
  try {
    redisClient = redis.createClient(redisConfig);
    
    // 监听连接事件
    redisClient.on('connect', () => {
      console.log('✅ Redis连接成功');
    });
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis连接错误:', err);
    });
    
    redisClient.on('ready', () => {
      console.log('✅ Redis客户端就绪');
    });
    
    redisClient.on('end', () => {
      console.log('ℹ️ Redis连接已关闭');
    });
    
    // 连接到Redis
    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('❌ Redis连接失败:', error);
    throw error;
  }
};

// 关闭Redis连接
const closeRedis = async () => {
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log('✅ Redis连接已关闭');
    }
  } catch (error) {
    console.error('❌ 关闭Redis连接失败:', error);
    throw error;
  }
};

// 获取Redis客户端
const getRedisClient = () => {
  return redisClient;
};

// 设置缓存
const setCache = async (key, value, expireTime = 3600) => {
  try {
    if (!redisClient) {
      throw new Error('Redis客户端未连接');
    }
    
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
    await redisClient.setEx(key, expireTime, serializedValue);
    return true;
  } catch (error) {
    console.error('❌ 设置缓存失败:', error);
    return false;
  }
};

// 获取缓存
const getCache = async (key) => {
  try {
    if (!redisClient) {
      throw new Error('Redis客户端未连接');
    }
    
    const value = await redisClient.get(key);
    if (!value) return null;
    
    // 尝试解析JSON
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error('❌ 获取缓存失败:', error);
    return null;
  }
};

// 删除缓存
const deleteCache = async (key) => {
  try {
    if (!redisClient) {
      throw new Error('Redis客户端未连接');
    }
    
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('❌ 删除缓存失败:', error);
    return false;
  }
};

// 清空所有缓存
const clearCache = async () => {
  try {
    if (!redisClient) {
      throw new Error('Redis客户端未连接');
    }
    
    await redisClient.flushAll();
    return true;
  } catch (error) {
    console.error('❌ 清空缓存失败:', error);
    return false;
  }
};

// RedisHelper类
class RedisHelper {
  static async set(key, value, expireTime = 3600) {
    try {
      return await setCache(key, value, expireTime);
    } catch (error) {
      console.warn('Redis不可用，跳过缓存设置:', error.message);
      return true; // 返回成功，避免阻塞流程
    }
  }
  
  static async get(key) {
    try {
      return await getCache(key);
    } catch (error) {
      console.warn('Redis不可用，跳过缓存获取:', error.message);
      return null;
    }
  }
  
  static async del(key) {
    try {
      return await deleteCache(key);
    } catch (error) {
      console.warn('Redis不可用，跳过缓存删除:', error.message);
      return true; // 返回成功，避免阻塞流程
    }
  }
  
  static async clear() {
    try {
      return await clearCache();
    } catch (error) {
      console.warn('Redis不可用，跳过缓存清空:', error.message);
      return true; // 返回成功，避免阻塞流程
    }
  }
  
  static async exists(key) {
    try {
      if (!redisClient) {
        throw new Error('Redis客户端未连接');
      }
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis不可用，跳过exists检查:', error.message);
      return false; // 返回false，表示不存在
    }
  }
}

module.exports = {
  connectRedis,
  closeRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCache,
  clearCache,
  redisConfig,
  RedisHelper
}; 
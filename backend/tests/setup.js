// 设置测试环境
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';
process.env.JWT_SECRET = 'test-secret-key';
process.env.REDIS_URL = 'redis://localhost:6379';

// 模拟 Redis 以避免测试时的连接错误
jest.mock('../src/config/redis', () => ({
  RedisHelper: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    exists: jest.fn().mockResolvedValue(false),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(true)
  }
}));

// 模拟 SMS 服务以便测试验证码功能
jest.mock('../src/services/smsService', () => ({
  sendVerificationCode: jest.fn().mockResolvedValue({
    success: true,
    message: '验证码发送成功',
    data: { code: '123456' }
  }),
  verifyCode: jest.fn().mockImplementation((phone, code, type) => {
    // 对于测试用例，总是返回验证成功
    return Promise.resolve(code === '123456');
  })
}));

const { sequelize } = require('../src/config/database');

// 全局测试设置
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Test database connected successfully');
    
    // 同步所有模型
    await sequelize.sync({ force: true });
    console.log('✅ Test database synchronized');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
});

// 全局测试清理
afterAll(async () => {
  try {
    if (sequelize && sequelize.connectionManager && !sequelize.connectionManager.pool.destroyed) {
      await sequelize.close();
      console.log('✅ Test database connection closed');
    }
  } catch (error) {
    // 忽略关闭数据库时的错误，因为可能已经被关闭了
    console.log('ℹ️ Database connection already closed or unavailable');
  }
}); 
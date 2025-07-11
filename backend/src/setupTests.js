// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = 3306;
process.env.DB_NAME = 'arcade_platform_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASS = 'test_password';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// 模拟console方法以减少测试输出
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// 全局测试超时
jest.setTimeout(10000);

// 模拟数据库连接
jest.mock('./config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  },
}));

// 模拟Redis连接
jest.mock('./config/redis', () => ({
  redis: {
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
  },
}));

// 模拟Socket.IO
jest.mock('socket.io', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    adapter: {
      rooms: new Map(),
    },
  }));
});

// 模拟邮件服务
jest.mock('./services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
}));

// 模拟文件上传
jest.mock('multer', () => {
  return jest.fn().mockReturnValue({
    single: jest.fn().mockReturnValue((req, res, next) => next()),
    array: jest.fn().mockReturnValue((req, res, next) => next()),
  });
});

// 模拟bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// 模拟jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 1 }),
}));

// 模拟crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-random-string'),
  }),
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash'),
  }),
}));

// 模拟uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

// 模拟moment
jest.mock('moment', () => {
  const mockMoment = jest.fn((date) => ({
    format: jest.fn().mockReturnValue('2023-01-01 00:00:00'),
    add: jest.fn().mockReturnThis(),
    subtract: jest.fn().mockReturnThis(),
    isBefore: jest.fn().mockReturnValue(false),
    isAfter: jest.fn().mockReturnValue(true),
    diff: jest.fn().mockReturnValue(0),
    toDate: jest.fn().mockReturnValue(new Date()),
    valueOf: jest.fn().mockReturnValue(1672531200000),
  }));
  
  mockMoment.utc = jest.fn().mockReturnValue(mockMoment());
  mockMoment.now = jest.fn().mockReturnValue(1672531200000);
  
  return mockMoment;
});

// 模拟node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

// 模拟sharp
jest.mock('sharp', () => {
  return jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image')),
    toFile: jest.fn().mockResolvedValue(true),
  });
});

// 模拟nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock-message-id',
    }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

// 模拟passport
jest.mock('passport', () => ({
  authenticate: jest.fn().mockReturnValue((req, res, next) => next()),
  use: jest.fn(),
  initialize: jest.fn().mockReturnValue((req, res, next) => next()),
  session: jest.fn().mockReturnValue((req, res, next) => next()),
}));

// 模拟passport-jwt
jest.mock('passport-jwt', () => {
  return jest.fn().mockImplementation(() => ({
    authenticate: jest.fn().mockReturnValue((req, res, next) => next()),
  }));
});

// 模拟passport-facebook
jest.mock('passport-facebook', () => {
  return jest.fn().mockImplementation(() => ({
    authenticate: jest.fn().mockReturnValue((req, res, next) => next()),
  }));
});

// 模拟passport-google-oauth20
jest.mock('passport-google-oauth20', () => {
  return jest.fn().mockImplementation(() => ({
    authenticate: jest.fn().mockReturnValue((req, res, next) => next()),
  }));
});

// 模拟winston
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// 模拟express-winston
jest.mock('express-winston', () => ({
  logger: jest.fn().mockReturnValue((req, res, next) => next()),
  errorLogger: jest.fn().mockReturnValue((req, res, next) => next()),
}));

// 模拟helmet
jest.mock('helmet', () => jest.fn().mockReturnValue((req, res, next) => next()));

// 模拟cors
jest.mock('cors', () => jest.fn().mockReturnValue((req, res, next) => next()));

// 模拟compression
jest.mock('compression', () => jest.fn().mockReturnValue((req, res, next) => next()));

// 模拟morgan
jest.mock('morgan', () => jest.fn().mockReturnValue((req, res, next) => next()));

// 模拟express-rate-limit
jest.mock('express-rate-limit', () => jest.fn().mockReturnValue((req, res, next) => next()));

// 模拟swagger-jsdoc
jest.mock('swagger-jsdoc', () => jest.fn().mockReturnValue({}));

// 模拟swagger-ui-express
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn(),
  setup: jest.fn().mockReturnValue((req, res, next) => next()),
}));

// 清理函数
global.cleanup = () => {
  jest.clearAllMocks();
};

// 模拟请求对象
global.mockRequest = (overrides = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  cookies: {},
  session: {},
  user: null,
  ...overrides,
});

// 模拟响应对象
global.mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.getHeader = jest.fn();
  res.removeHeader = jest.fn().mockReturnValue(res);
  return res;
};

// 模拟next函数
global.mockNext = jest.fn(); 
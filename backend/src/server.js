const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 设置默认环境变量（如果没有.env文件）
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secure-jwt-secret-key-change-this-in-production';
}
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost';
}
if (!process.env.DB_PORT) {
  process.env.DB_PORT = '3306';
}
if (!process.env.DB_NAME) {
  process.env.DB_NAME = 'arcade_platform';
}
if (!process.env.DB_USER) {
  process.env.DB_USER = 'arcade_user';
}
if (!process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = 'arcade_pass';
}
if (!process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN = 'http://localhost:3000';
}

// 导入路由和中间件
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const gameRoutes = require('./routes/game');
const socialRoutes = require('./routes/social');
const battleRoutes = require('./routes/battle');

// 导入Socket.IO处理器
const socketHandler = require('./socket/socketHandler');

// 导入数据库连接
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');

// 导入中间件
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');

const app = express();
const server = http.createServer(app);

// Socket.IO配置
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// 全局中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined'));
app.use(requestLogger);

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});
app.use('/api/', limiter);

// 更严格的登录速率限制
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次登录尝试
  message: {
    error: '登录尝试过于频繁，请15分钟后再试'
  }
});
app.use('/api/auth/login', authLimiter);

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/battles', battleRoutes);

// API文档
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📚 API文档可在 http://localhost:5000/api-docs 查看');
}

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use(errorHandler);

// Socket.IO事件处理
socketHandler(io);

// 数据库连接
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('✅ MySQL数据库连接成功');
    
    // 尝试连接Redis，但不阻止服务器启动
    try {
      await connectRedis();
      console.log('✅ Redis缓存连接成功');
    } catch (redisError) {
      console.warn('⚠️ Redis连接失败，服务器将继续运行（缓存功能不可用）:', redisError.message);
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
};

// 服务器启动
const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

const startServer = async () => {
  try {
    await initializeDatabase();
    
    // 启动HTTP服务器
    server.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`🎮 Socket.IO服务运行在端口 ${SOCKET_PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📱 前端开发服务器: http://localhost:3000`);
        console.log(`🔧 后端API服务器: http://localhost:${PORT}`);
      }
    });

    // 优雅关闭处理
    process.on('SIGTERM', () => {
      console.log('🔄 收到SIGTERM信号，开始优雅关闭...');
      server.close(() => {
        console.log('✅ HTTP服务器已关闭');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🔄 收到SIGINT信号，开始优雅关闭...');
      server.close(() => {
        console.log('✅ HTTP服务器已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 启动服务器
startServer();

module.exports = { app, server, io }; 
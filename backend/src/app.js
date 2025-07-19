console.log('===============App. JS=======================');
console.log('===============App. JS=======================');
console.log('===============App. JS=======================');
console.log('===============App. JS=======================');
console.log('===============App. JS=======================');

const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const { specs } = require('./config/swagger');

// 初始化模型关联
require('./models');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Import routes
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/user');
// const gameRoutes = require('./routes/game');
// const battleRoutes = require('./routes/battle');
// const socialRoutes = require('./routes/social');
// const apiRouter = require('./routes/api');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
console.log('=========================================');
console.log('=========================================');
console.log('=========================================');
// app.use('/api/auth', authRoutes);
// app.use('/api/users', authMiddleware, userRoutes);
// app.use('/api/games', authMiddleware, gameRoutes);
// app.use('/api/battle', authMiddleware, battleRoutes);
// app.use('/api/social', authMiddleware, socialRoutes);
app.use('/api', apiRouter);
console.log('authRoutes 是否有效:', authRoutes instanceof require('express').Router); 

// 404 handler
// app.use('*', (req, res) => {
//   console.log('未匹配的请求:', req.method, req.path);
//   res.status(404).json({
//     success: false,
//     message: 'API endpoint not found'
//   });
// });

// Error handling middleware
app.use(errorHandler);

module.exports = app; 
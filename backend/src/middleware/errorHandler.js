const errorHandler = (err, req, res, next) => {
  console.error('错误:', err);

  // 默认错误
  let error = { ...err };
  error.message = err.message;

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = '资源不存在';
    error = { message, statusCode: 404 };
  }

  // Mongoose 重复键错误
  if (err.code === 11000) {
    const message = '数据已存在';
    error = { message, statusCode: 400 };
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌';
    error = { message, statusCode: 401 };
  }

  // JWT 过期错误
  if (err.name === 'TokenExpiredError') {
    const message = '令牌已过期';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
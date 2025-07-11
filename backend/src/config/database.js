const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'test') {
  // 测试环境使用SQLite内存数据库
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false, // 禁用日志输出
    define: {
      timestamps: true,
      underscored: true,
    },
  });
} else {
  // 生产和开发环境使用MySQL
  sequelize = new Sequelize(
    process.env.DB_NAME || 'arcade_platform',
    process.env.DB_USER || 'arcade_user',
    process.env.DB_PASSWORD || 'arcade_pass',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
      },
    }
  );
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
}; 
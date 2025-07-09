const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'arcade_user',
  password: process.env.DB_PASSWORD || 'arcade_pass',
  database: process.env.DB_NAME || 'arcade_platform',
  logging: false
});

async function createTestUser() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 创建用户表（如果不存在）
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) DEFAULT NULL,
        nickname VARCHAR(50) NOT NULL,
        avatar VARCHAR(255) DEFAULT NULL,
        gender ENUM('male', 'female', 'other') DEFAULT 'other',
        birth_date DATE DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255) DEFAULT NULL,
        reset_password_token VARCHAR(255) DEFAULT NULL,
        reset_password_expires DATETIME DEFAULT NULL,
        last_login_at DATETIME DEFAULT NULL,
        last_login_ip VARCHAR(45) DEFAULT NULL,
        login_count INT(11) DEFAULT 0,
        oauth_providers JSON DEFAULT NULL,
        google_id VARCHAR(100) DEFAULT NULL,
        facebook_id VARCHAR(100) DEFAULT NULL,
        level INT(11) DEFAULT 1,
        experience INT(11) DEFAULT 0,
        coins INT(11) DEFAULT 1000,
        diamonds INT(11) DEFAULT 0,
        total_games INT(11) DEFAULT 0,
        total_wins INT(11) DEFAULT 0,
        total_losses INT(11) DEFAULT 0,
        total_draws INT(11) DEFAULT 0,
        highest_score INT(11) DEFAULT 0,
        total_playtime INT(11) DEFAULT 0,
        friend_count INT(11) DEFAULT 0,
        settings JSON DEFAULT NULL,
        last_checkin_date DATE DEFAULT NULL,
        consecutive_checkin_days INT(11) DEFAULT 0,
        total_checkin_days INT(11) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        PRIMARY KEY (id),
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 生成密码哈希
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // 检查用户是否已存在
    const [existingUsers] = await sequelize.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      {
        replacements: ['demo', 'demo@example.com']
      }
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  测试用户已存在，更新密码...');
      await sequelize.query(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ? OR email = ?',
        {
          replacements: [hashedPassword, 'demo', 'demo@example.com']
        }
      );
    } else {
      console.log('📝 创建测试用户...');
      await sequelize.query(
        `INSERT INTO users (username, email, password, nickname, status, is_verified, level, experience, coins, diamonds) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            'demo',
            'demo@example.com',
            hashedPassword,
            '演示用户',
            'active',
            true,
            1,
            0,
            1000,
            0
          ]
        }
      );
    }

    console.log('✅ 测试用户创建/更新成功！');
    console.log('📋 登录信息:');
    console.log('   用户名: demo');
    console.log('   邮箱: demo@example.com');
    console.log('   密码: demo123');

  } catch (error) {
    console.error('❌ 创建测试用户失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 运行脚本
createTestUser(); 
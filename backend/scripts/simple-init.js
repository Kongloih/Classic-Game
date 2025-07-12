const mysql = require('mysql2/promise');

// 简化的数据库配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // 空密码
  charset: 'utf8mb4'
};

async function createDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始创建数据库...');
    
    // 连接到MySQL服务器
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 连接到MySQL服务器成功');
    
    // 创建数据库
    await connection.execute('CREATE DATABASE IF NOT EXISTS arcade_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 数据库 arcade_platform 创建成功');
    
    // 使用数据库
    await connection.execute('USE arcade_platform');
    console.log('✅ 切换到 arcade_platform 数据库');
    
    // 创建核心表
    await createTables(connection);
    
    // 插入初始数据
    await insertInitialData(connection);
    
    console.log('🎉 数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 提示: 请检查MySQL密码配置');
      console.log('   1. 确保MySQL服务正在运行');
      console.log('   2. 检查用户名和密码是否正确');
      console.log('   3. 或者修改脚本中的数据库配置');
    }
    
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function createTables(connection) {
  console.log('\n📝 创建表结构...');
  
  const tables = [
    // 用户表
    `CREATE TABLE IF NOT EXISTS users (
      id INT(11) NOT NULL AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) DEFAULT NULL,
      nickname VARCHAR(50) NOT NULL,
      avatar VARCHAR(255) DEFAULT NULL,
      level INT(11) DEFAULT 1,
      experience INT(11) DEFAULT 0,
      coins INT(11) DEFAULT 1000,
      diamonds INT(11) DEFAULT 0,
      status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
      is_verified BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    
    // 游戏表
    `CREATE TABLE IF NOT EXISTS games (
      id INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      name_en VARCHAR(100) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      category ENUM('fighting', 'action', 'shooting', 'puzzle', 'racing', 'sports', 'platform', 'arcade', 'strategy', 'rpg') NOT NULL,
      developer VARCHAR(100) DEFAULT NULL,
      publisher VARCHAR(100) DEFAULT NULL,
      release_year INT(4) DEFAULT NULL,
      supports_online BOOLEAN DEFAULT FALSE,
      max_players INT(1) DEFAULT 1,
      is_featured BOOLEAN DEFAULT FALSE,
      status ENUM('active', 'inactive', 'maintenance', 'deprecated') DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    
    // 战斗房间表
    `CREATE TABLE IF NOT EXISTS battle_rooms (
      id INT(11) NOT NULL AUTO_INCREMENT,
      room_id VARCHAR(20) NOT NULL,
      game_id INT(11) NOT NULL,
      name VARCHAR(100) NOT NULL,
      status ENUM('未满员', '满员') DEFAULT '未满员',
      online_users INT(11) DEFAULT 0,
      max_user INT(11) DEFAULT 500,
      max_tables INT(11) DEFAULT 50,
      current_tables INT(11) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_room_game (room_id, game_id),
      FOREIGN KEY (game_id) REFERENCES games (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    
    // 战斗桌子表
    `CREATE TABLE IF NOT EXISTS battle_tables (
      id INT(11) NOT NULL AUTO_INCREMENT,
      table_id VARCHAR(20) NOT NULL,
      room_id INT(11) NOT NULL,
      seat_1_user_id INT(11) DEFAULT NULL,
      seat_2_user_id INT(11) DEFAULT NULL,
      seat_3_user_id INT(11) DEFAULT NULL,
      seat_4_user_id INT(11) DEFAULT NULL,
      status ENUM('empty', 'waiting', 'playing', 'finished') DEFAULT 'empty',
      current_players INT(11) DEFAULT 0,
      max_players INT(11) DEFAULT 4,
      game_start_time DATETIME DEFAULT NULL,
      game_end_time DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_table_room (table_id, room_id),
      FOREIGN KEY (room_id) REFERENCES battle_rooms (id) ON DELETE CASCADE,
      FOREIGN KEY (seat_1_user_id) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (seat_2_user_id) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (seat_3_user_id) REFERENCES users (id) ON DELETE SET NULL,
      FOREIGN KEY (seat_4_user_id) REFERENCES users (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    
    // 用户状态表
    `CREATE TABLE IF NOT EXISTS user_status (
      id INT(11) NOT NULL AUTO_INCREMENT,
      user_id INT(11) NOT NULL,
      room_id INT(11) DEFAULT NULL,
      table_id INT(11) DEFAULT NULL,
      seat_number INT(11) DEFAULT NULL,
      status ENUM('idle', 'waiting', 'playing', 'spectating') DEFAULT 'idle',
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES battle_rooms (id) ON DELETE SET NULL,
      FOREIGN KEY (table_id) REFERENCES battle_tables (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
  ];
  
  for (let i = 0; i < tables.length; i++) {
    try {
      await connection.execute(tables[i]);
      console.log(`✅ 表 ${i + 1} 创建成功`);
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log(`⚠️  表 ${i + 1} 已存在`);
      } else {
        console.error(`❌ 表 ${i + 1} 创建失败:`, error.message);
        throw error;
      }
    }
  }
}

async function insertInitialData(connection) {
  console.log('\n📊 插入初始数据...');
  
  try {
    // 插入游戏数据
    const games = [
      ['俄罗斯方块', 'Tetris', 'puzzle', 'Alexey Pajitnov', 'Nintendo', 1984, '经典益智游戏，考验空间思维能力', TRUE, 4, TRUE],
      ['贪吃蛇', 'Snake', 'arcade', 'Gremlin Industries', 'Gremlin Industries', 1976, '经典街机游戏，控制蛇吃食物成长', TRUE, 4, TRUE],
      ['打砖块', 'Breakout', 'arcade', 'Atari', 'Atari', 1976, '经典弹球游戏，用挡板反弹球击碎砖块', TRUE, 2, TRUE],
      ['拳皇97', 'The King of Fighters 97', 'fighting', 'SNK', 'SNK', 1997, '经典格斗游戏，拳皇系列的巅峰之作', TRUE, 2, TRUE],
      ['街头霸王2', 'Street Fighter II', 'fighting', 'Capcom', 'Capcom', 1991, '格斗游戏的鼻祖，影响了整个格斗游戏行业', TRUE, 2, TRUE]
    ];
    
    for (const game of games) {
      await connection.execute(
        'INSERT IGNORE INTO games (name, name_en, category, developer, publisher, release_year, description, supports_online, max_players, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        game
      );
    }
    console.log('✅ 游戏数据插入成功');
    
    // 插入用户数据
    const users = [
      ['admin', 'admin@arcade-platform.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewSiWrp3DGEVo/xS', '管理员', 99, 999999, 'active', TRUE],
      ['demo', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '演示用户', 1, 1000, 'active', TRUE]
    ];
    
    for (const user of users) {
      await connection.execute(
        'INSERT IGNORE INTO users (username, email, password, nickname, level, coins, status, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('✅ 用户数据插入成功');
    
  } catch (error) {
    console.error('❌ 数据插入失败:', error.message);
    throw error;
  }
}

// 运行初始化
if (require.main === module) {
  createDatabase()
    .then(() => {
      console.log('\n🎉 数据库初始化完成！');
      console.log('\n📋 下一步:');
      console.log('   1. 运行 npm run battle:init 初始化战斗系统');
      console.log('   2. 启动服务器 npm run dev');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 初始化失败:', error.message);
      process.exit(1);
    });
}

module.exports = { createDatabase }; 
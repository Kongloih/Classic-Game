const mysql = require('mysql2/promise');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 询问用户输入
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getDatabaseConfig() {
  console.log('🔧 数据库配置向导');
  console.log('==================');
  
  const host = await question('MySQL主机地址 (默认: localhost): ') || 'localhost';
  const port = await question('MySQL端口 (默认: 3306): ') || '3306';
  const user = await question('MySQL用户名 (默认: root): ') || 'root';
  const password = await question('MySQL密码: ');
  const database = await question('数据库名称 (默认: arcade_platform): ') || 'arcade_platform';
  
  return { host, port, user, password, database };
}

async function createDatabase() {
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 获取数据库配置
    const dbConfig = await getDatabaseConfig();
    
    // 连接到MySQL服务器
    const serverConfig = {
      host: dbConfig.host,
      port: parseInt(dbConfig.port),
      user: dbConfig.user,
      password: dbConfig.password,
      charset: 'utf8mb4'
    };
    
    console.log('🔌 连接到MySQL服务器...');
    const connection = await mysql.createConnection(serverConfig);
    console.log('✅ 连接到MySQL服务器成功');
    
    // 创建数据库
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ 数据库 ${dbConfig.database} 创建成功`);
    
    // 使用数据库
    await connection.execute(`USE ${dbConfig.database}`);
    console.log(`✅ 切换到 ${dbConfig.database} 数据库`);
    
    // 创建表结构
    await createTables(connection);
    
    // 插入初始数据
    await insertInitialData(connection);
    
    // 验证表结构
    await verifyTables(connection);
    
    await connection.end();
    rl.close();
    
    console.log('\n🎉 数据库初始化完成！');
    console.log('\n📋 下一步:');
    console.log('   1. 运行 npm run battle:init 初始化战斗系统');
    console.log('   2. 启动服务器 npm run dev');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    rl.close();
    process.exit(1);
  }
}

async function createTables(connection) {
  console.log('\n📝 创建表结构...');
  
  const tables = [
    {
      name: 'users',
      sql: `CREATE TABLE IF NOT EXISTS users (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    {
      name: 'games',
      sql: `CREATE TABLE IF NOT EXISTS games (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    {
      name: 'battle_rooms',
      sql: `CREATE TABLE IF NOT EXISTS battle_rooms (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    {
      name: 'battle_tables',
      sql: `CREATE TABLE IF NOT EXISTS battle_tables (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    },
    {
      name: 'user_status',
      sql: `CREATE TABLE IF NOT EXISTS user_status (
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
    }
  ];
  
  for (const table of tables) {
    try {
      await connection.execute(table.sql);
      console.log(`✅ 表 ${table.name} 创建成功`);
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log(`⚠️  表 ${table.name} 已存在`);
      } else {
        console.error(`❌ 表 ${table.name} 创建失败:`, error.message);
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

async function verifyTables(connection) {
  console.log('\n🔍 验证表结构...');
  
  try {
    const tables = ['users', 'games', 'battle_rooms', 'battle_tables', 'user_status'];
    
    for (const table of tables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`✅ 表 ${table} 存在 (${columns.length} 个字段)`);
      } else {
        console.log(`❌ 表 ${table} 不存在`);
      }
    }
    
    // 检查数据
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [gameCount] = await connection.execute('SELECT COUNT(*) as count FROM games');
    
    console.log('\n📊 数据统计:');
    console.log(`  - 用户数量: ${userCount[0].count}`);
    console.log(`  - 游戏数量: ${gameCount[0].count}`);
    
  } catch (error) {
    console.error('❌ 验证表结构失败:', error.message);
  }
}

// 运行初始化
if (require.main === module) {
  createDatabase()
    .then(() => {
      console.log('\n🎉 数据库初始化完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 初始化失败:', error.message);
      process.exit(1);
    });
}

module.exports = { createDatabase }; 
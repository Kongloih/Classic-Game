const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'arcade_platform',
  charset: 'utf8mb4'
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化数据库...');
    
    // 连接到MySQL服务器（不指定数据库）
    const serverConfig = { ...dbConfig };
    delete serverConfig.database;
    
    connection = await mysql.createConnection(serverConfig);
    console.log('✅ 连接到MySQL服务器成功');
    
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, '../../database/init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割SQL语句
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 准备执行 ${statements.length} 条SQL语句`);
    
    // 逐条执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ 执行语句 ${i + 1}/${statements.length}`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️  语句 ${i + 1}/${statements.length} 已存在，跳过`);
          } else {
            console.error(`❌ 执行语句 ${i + 1}/${statements.length} 失败:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 数据库初始化完成！');
    
    // 验证表是否创建成功
    await verifyTables(connection);
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function verifyTables(connection) {
  try {
    console.log('\n🔍 验证表结构...');
    
    // 检查核心表是否存在
    const tables = [
      'users',
      'games', 
      'battle_rooms',
      'battle_tables',
      'user_status',
      'friendships',
      'game_records',
      'user_favorites',
      'game_ratings'
    ];
    
    for (const table of tables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`✅ 表 ${table} 存在`);
        
        // 检查表结构
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`   - 字段数量: ${columns.length}`);
      } else {
        console.log(`❌ 表 ${table} 不存在`);
      }
    }
    
    // 检查数据
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [gameCount] = await connection.execute('SELECT COUNT(*) as count FROM games');
    const [roomCount] = await connection.execute('SELECT COUNT(*) as count FROM battle_rooms');
    const [tableCount] = await connection.execute('SELECT COUNT(*) as count FROM battle_tables');
    
    console.log('\n📊 数据统计:');
    console.log(`  - 用户数量: ${userCount[0].count}`);
    console.log(`  - 游戏数量: ${gameCount[0].count}`);
    console.log(`  - 房间数量: ${roomCount[0].count}`);
    console.log(`  - 桌子数量: ${tableCount[0].count}`);
    
  } catch (error) {
    console.error('❌ 验证表结构失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('\n🎉 数据库初始化脚本执行完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ 数据库初始化脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase, verifyTables }; 
const { sequelize } = require('../backend/src/config/database');
const fs = require('fs');
const path = require('path');

async function initAllTables() {
  try {
    console.log('🔧 开始初始化所有数据库表...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 要执行的SQL文件列表
    const sqlFiles = [
      'create_user_status_table.sql',
      'create_user_status_history.sql'
    ];
    
    for (const sqlFile of sqlFiles) {
      console.log(`\n📄 执行SQL文件: ${sqlFile}`);
      
      const sqlFilePath = path.join(__dirname, sqlFile);
      if (!fs.existsSync(sqlFilePath)) {
        console.log(`⚠️ 文件不存在: ${sqlFilePath}`);
        continue;
      }
      
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      
      // 分割SQL语句
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
      
      // 执行SQL语句
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            await sequelize.query(statement);
            console.log(`✅ 执行语句 ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          } catch (error) {
            if (error.message.includes('already exists')) {
              console.log(`⚠️ 语句 ${i + 1} 已存在，跳过: ${error.message}`);
            } else {
              console.error(`❌ 执行语句 ${i + 1} 失败:`, error.message);
            }
          }
        }
      }
    }
    
    // 验证表是否创建成功
    console.log('\n🔍 验证表创建结果...');
    
    const tablesToCheck = ['user_status', 'user_status_history'];
    
    for (const tableName of tablesToCheck) {
      const [results] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
      if (results.length > 0) {
        console.log(`✅ ${tableName} 表创建成功`);
        
        // 显示表结构
        const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
        console.log(`📊 ${tableName} 表结构:`);
        columns.forEach(col => {
          console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
      } else {
        console.error(`❌ ${tableName} 表创建失败`);
      }
    }
    
    // 显示触发器（如果有）
    const [triggers] = await sequelize.query("SHOW TRIGGERS");
    if (triggers.length > 0) {
      console.log('\n🔧 触发器:');
      triggers.forEach(trigger => {
        console.log(`  ${trigger.Trigger}: ${trigger.Timing} ${trigger.Event} ON ${trigger.Table}`);
      });
    }
    
    console.log('\n✅ 所有表初始化完成');
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initAllTables(); 
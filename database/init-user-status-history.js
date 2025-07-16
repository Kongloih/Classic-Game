const { sequelize } = require('../backend/src/config/database');
const fs = require('fs');
const path = require('path');

async function initUserStatusHistory() {
  try {
    console.log('🔧 开始初始化 user_status_history 表...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 读取 SQL 文件
    const sqlFilePath = path.join(__dirname, 'create_user_status_history.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割 SQL 语句（按分号分割，但忽略触发器中的分号）
    const statements = [];
    let currentStatement = '';
    let inTrigger = false;
    let delimiter = ';';
    
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检查是否进入触发器定义
      if (trimmedLine.startsWith('DELIMITER')) {
        delimiter = trimmedLine.split(' ')[1];
        continue;
      }
      
      // 检查是否在触发器内
      if (trimmedLine.includes('CREATE TRIGGER')) {
        inTrigger = true;
      }
      
      currentStatement += line + '\n';
      
      // 检查语句结束
      if (trimmedLine.endsWith(delimiter) && !inTrigger) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      } else if (inTrigger && trimmedLine === 'END' + delimiter) {
        statements.push(currentStatement.trim());
        currentStatement = '';
        inTrigger = false;
      }
    }
    
    // 执行 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--') && !statement.startsWith('/*')) {
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
    
    // 验证表是否创建成功
    const [results] = await sequelize.query("SHOW TABLES LIKE 'user_status_history'");
    if (results.length > 0) {
      console.log('✅ user_status_history 表创建成功');
      
      // 显示表结构
      const [columns] = await sequelize.query("DESCRIBE user_status_history");
      console.log('📊 表结构:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // 显示触发器
      const [triggers] = await sequelize.query("SHOW TRIGGERS LIKE 'user_status_history'");
      if (triggers.length > 0) {
        console.log('🔧 触发器:');
        triggers.forEach(trigger => {
          console.log(`  ${trigger.Trigger}: ${trigger.Timing} ${trigger.Event} ON ${trigger.Table}`);
        });
      }
    } else {
      console.error('❌ user_status_history 表创建失败');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initUserStatusHistory(); 
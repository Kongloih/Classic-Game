const { sequelize } = require('../src/config/database');

async function testDatabase() {
  try {
    console.log('🔧 测试数据库连接...');
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 显示连接信息
    const config = sequelize.config;
    console.log('📋 数据库配置:');
    console.log('  数据库名:', config.database);
    console.log('  主机:', config.host);
    console.log('  端口:', config.port);
    console.log('  用户名:', config.username);
    
    // 测试查询
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ 数据库查询测试成功:', results);
    
    // 检查users表是否存在
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'users'");
    if (tables.length > 0) {
      console.log('✅ users表存在');
      
      // 检查表结构
      const [columns] = await sequelize.query("DESCRIBE users");
      console.log('📋 users表结构:');
      columns.forEach(col => {
        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('❌ users表不存在');
    }
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabase(); 
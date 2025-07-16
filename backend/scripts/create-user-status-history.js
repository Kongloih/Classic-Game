const { sequelize } = require('../src/config/database');
const UserStatusHistory = require('../src/models/UserStatusHistory');

async function createUserStatusHistoryTable() {
  try {
    console.log('🔄 开始创建user_status_history表...');
    
    // 同步模型到数据库
    await UserStatusHistory.sync({ force: false });
    
    console.log('✅ user_status_history表创建成功');
    
    // 验证表结构
    const tableInfo = await sequelize.query(
      "DESCRIBE user_status_history",
      { type: sequelize.QueryTypes.DESCRIBE }
    );
    
    console.log('📊 表结构信息:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ 创建user_status_history表失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createUserStatusHistoryTable()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = createUserStatusHistoryTable; 
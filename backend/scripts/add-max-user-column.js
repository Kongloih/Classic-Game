const { sequelize } = require('../src/config/database');

async function addMaxUserColumn() {
  try {
    console.log('🔧 开始添加 max_user 字段...');
    
    // 检查字段是否已存在
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'battle_rooms' 
      AND COLUMN_NAME = 'max_user'
    `);
    
    if (results.length > 0) {
      console.log('⚠️  max_user 字段已存在，跳过添加');
    } else {
      // 添加 max_user 字段
      await sequelize.query(`
        ALTER TABLE battle_rooms 
        ADD COLUMN max_user INT DEFAULT 500 
        COMMENT '房间最大容纳用户数量'
      `);
      console.log('✅ 成功添加 max_user 字段');
    }
    
    // 更新现有房间的 max_user 值
    const [updateResults] = await sequelize.query(`
      UPDATE battle_rooms 
      SET max_user = 500 
      WHERE max_user IS NULL OR max_user = 0
    `);
    
    console.log(`✅ 更新了 ${updateResults.affectedRows} 个房间的 max_user 值`);
    
    // 验证更新结果
    const [rooms] = await sequelize.query(`
      SELECT room_id, name, online_users, max_user, status 
      FROM battle_rooms 
      LIMIT 5
    `);
    
    console.log('📊 房间状态示例:');
    rooms.forEach(room => {
      console.log(`  - ${room.name} (${room.room_id}): ${room.online_users}/${room.max_user} 用户, 状态: ${room.status}`);
    });
    
    console.log('🎉 max_user 字段添加完成！');
    
  } catch (error) {
    console.error('❌ 添加 max_user 字段失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addMaxUserColumn(); 
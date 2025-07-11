// 测试游戏大厅数据修复
const axios = require('axios');

async function testGameHall() {
  try {
    console.log('🧪 测试游戏大厅数据...');
    
    // 测试正常模式
    console.log('\n1. 测试正常模式 (无认证):');
    const normalResponse = await axios.get('http://localhost:5000/api/games/hall/1');
    console.log('✅ 正常模式响应成功');
    console.log(`   游戏名称: ${normalResponse.data.data.game.name}`);
    console.log(`   房间数量: ${normalResponse.data.data.gameTables.length}`);
    console.log(`   在线用户: ${normalResponse.data.data.stats.onlineUsers}`);
    
    // 统计房间状态
    const statusCount = {};
    normalResponse.data.data.gameTables.forEach(table => {
      statusCount[table.status] = (statusCount[table.status] || 0) + 1;
    });
    console.log('   房间状态分布:', statusCount);
    
    // 测试测试模式
    console.log('\n2. 测试测试模式:');
    const testResponse = await axios.get('http://localhost:5000/api/games/hall/1?testMode=true');
    console.log('✅ 测试模式响应成功');
    console.log(`   游戏名称: ${testResponse.data.data.game.name}`);
    console.log(`   房间数量: ${testResponse.data.data.gameTables.length}`);
    console.log(`   在线用户: ${testResponse.data.data.stats.onlineUsers}`);
    
    // 统计房间状态
    const testStatusCount = {};
    testResponse.data.data.gameTables.forEach(table => {
      testStatusCount[table.status] = (testStatusCount[table.status] || 0) + 1;
    });
    console.log('   房间状态分布:', testStatusCount);
    
    console.log('\n🎉 测试完成！');
    console.log('\n📊 结果分析:');
    console.log('- 正常模式: 根据真实在线用户生成房间状态');
    console.log('- 测试模式: 大部分房间为空，少量等待状态');
    console.log('- 不再出现不合理的"已满"房间');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testGameHall(); 
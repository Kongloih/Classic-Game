const axios = require('axios');

async function testRoomFormat() {
  try {
    console.log('🧪 测试房间ID格式...');
    
    // 测试贪吃蛇游戏大厅 (gameId = 2)
    const response = await axios.get('http://localhost:5000/api/games/hall/2');
    
    if (response.data.success) {
      const gameTables = response.data.data.gameTables;
      console.log(`📊 获取到 ${gameTables.length} 个房间`);
      
      gameTables.forEach((table, index) => {
        console.log(`房间 ${index + 1}: ID="${table.id}", 状态="${table.status}", 玩家数=${table.players.length}`);
        
        // 检查ID格式
        if (table.id.includes('_')) {
          const parts = table.id.split('_');
          const gameId = parseInt(parts[0]);
          const roomNumber = parts[1];
          
          console.log(`  ✅ 格式正确: gameId=${gameId}, roomNumber=${roomNumber}`);
          
          if (gameId === 2) {
            console.log(`  ✅ 贪吃蛇游戏ID正确`);
          } else {
            console.log(`  ❌ 游戏ID错误，应该是2，实际是${gameId}`);
          }
        } else {
          console.log(`  ❌ ID格式错误: ${table.id}`);
        }
      });
    } else {
      console.log('❌ API请求失败:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testRoomFormat(); 
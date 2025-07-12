const io = require('socket.io-client');

// 测试房间加入功能
async function testRoomJoin() {
  console.log('🧪 开始测试房间加入功能...');
  
  // 创建测试模式的socket连接
  const socket = io('http://localhost:5000', {
    auth: { testMode: true },
    query: { testMode: 'true' }
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✅ Socket连接成功');
      
      // 测试加入房间1
      console.log('🔧 尝试加入房间 1...');
      socket.emit('join_game_room', {
        roomId: '1',
        gameType: '俄罗斯方块'
      });
    });

    socket.on('room_info', (data) => {
      console.log('✅ 收到房间信息:', data);
      console.log(`房间ID: ${data.roomId} (类型: ${typeof data.roomId})`);
      console.log(`游戏类型: ${data.gameType}`);
      console.log(`玩家数量: ${data.players.length}`);
      console.log(`游戏状态: ${data.gameState}`);
      
      // 测试成功
      socket.disconnect();
      resolve(true);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket连接失败:', error.message);
      reject(error);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket连接断开');
    });

    // 设置超时
    setTimeout(() => {
      console.error('❌ 测试超时');
      socket.disconnect();
      reject(new Error('测试超时'));
    }, 10000);
  });
}

// 运行测试
testRoomJoin()
  .then(() => {
    console.log('🎉 房间加入测试成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 房间加入测试失败:', error.message);
    process.exit(1);
  }); 
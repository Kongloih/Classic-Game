const io = require('socket.io-client');

// 测试准备状态功能
async function testReadyStatus() {
  console.log('🧪 开始测试准备状态功能...');
  
  // 创建测试模式的socket连接
  const socket = io('http://localhost:5000', {
    auth: { testMode: true },
    query: { testMode: 'true' }
  });

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      console.log('✅ Socket连接成功');
      
      // 加入房间1
      console.log('🔧 加入房间 1...');
      socket.emit('join_game_room', {
        roomId: '1',
        gameType: '俄罗斯方块'
      });
    });

    socket.on('room_info', (data) => {
      console.log('✅ 收到房间信息:', data);
      console.log(`房间ID: ${data.roomId}`);
      console.log(`玩家数量: ${data.players.length}`);
      
      // 等待1秒后发送准备状态
      setTimeout(() => {
        console.log('🔧 发送准备状态...');
        socket.emit('player_ready', {
          roomId: '1',
          isReady: true
        });
      }, 1000);
    });

    socket.on('player_ready_status', (data) => {
      console.log('✅ 收到准备状态更新:', data);
      console.log(`玩家: ${data.playerName}`);
      console.log(`准备状态: ${data.isReady}`);
      
      // 测试成功
      setTimeout(() => {
        socket.disconnect();
        resolve(true);
      }, 1000);
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
    }, 15000);
  });
}

// 运行测试
testReadyStatus()
  .then(() => {
    console.log('🎉 准备状态测试成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 准备状态测试失败:', error.message);
    process.exit(1);
  }); 
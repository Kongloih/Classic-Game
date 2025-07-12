// 测试 WebSocket 连接和事件处理
const io = require('socket.io-client');

const testSocket = async () => {
  console.log('🧪 开始测试 WebSocket 连接...');
  
  // 创建测试用户token（这里使用一个简单的测试token）
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczNDU2NzIwMCwiZXhwIjoxNzM0NjUzNjAwfQ.test';
  
  const socket = io('http://localhost:5000', {
    auth: { token: testToken },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket 连接成功');
    
    // 测试加入桌子事件
    console.log('🧪 测试加入桌子事件...');
    socket.emit('join_table', {
      tableId: 'table_1',
      seatNumber: 2,
      userId: 1,
      username: 'testuser'
    });
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket 连接失败:', error.message);
  });

  socket.on('join_table_success', (data) => {
    console.log('✅ 加入桌子成功:', data);
  });

  socket.on('join_table_failed', (data) => {
    console.log('❌ 加入桌子失败:', data);
  });

  socket.on('player_joined_table', (data) => {
    console.log('👤 其他玩家加入桌子:', data);
  });

  // 5秒后断开连接
  setTimeout(() => {
    console.log('🔌 断开 WebSocket 连接');
    socket.disconnect();
    process.exit(0);
  }, 5000);
};

// 运行测试
testSocket().catch(console.error); 
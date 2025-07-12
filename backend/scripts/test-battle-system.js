const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

// 模拟用户登录
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'testuser',
      password: 'testpass123'
    });
    
    if (response.data.success) {
      authToken = response.data.data.token;
      console.log('✅ 登录成功');
      return true;
    }
  } catch (error) {
    console.log('❌ 登录失败，使用测试模式');
    return false;
  }
}

// 设置请求头
function getHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

// 测试获取游戏房间
async function testGetGameRooms() {
  try {
    console.log('\n🧪 测试获取游戏房间...');
    const response = await axios.get(`${BASE_URL}/battles/rooms/2`, { headers: getHeaders() });
    
    if (response.data.success) {
      const rooms = response.data.data;
      console.log(`✅ 获取到 ${rooms.length} 个房间:`);
      rooms.forEach(room => {
        console.log(`  - ${room.name} (${room.room_id}): ${room.status}, 在线用户: ${room.online_users}`);
      });
      return rooms;
    }
  } catch (error) {
    console.error('❌ 获取游戏房间失败:', error.response?.data?.message || error.message);
    return [];
  }
}

// 测试进入房间
async function testEnterRoom(roomId) {
  try {
    console.log(`\n🧪 测试进入房间 ${roomId}...`);
    const response = await axios.post(`${BASE_URL}/battles/rooms/${roomId}/enter`, {}, { headers: getHeaders() });
    
    if (response.data.success) {
      console.log('✅ 成功进入房间');
      return true;
    }
  } catch (error) {
    console.error('❌ 进入房间失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试获取房间桌子
async function testGetRoomTables(roomId) {
  try {
    console.log(`\n🧪 测试获取房间 ${roomId} 的桌子...`);
    const response = await axios.get(`${BASE_URL}/battles/tables/${roomId}`, { headers: getHeaders() });
    
    if (response.data.success) {
      const tables = response.data.data;
      console.log(`✅ 获取到 ${tables.length} 张桌子`);
      
      // 显示前5张桌子的状态
      tables.slice(0, 5).forEach(table => {
        const occupiedSeats = Object.values(table.seats).filter(user => user !== null).length;
        console.log(`  - ${table.table_id}: ${table.status}, 玩家: ${occupiedSeats}/${table.max_players}`);
      });
      
      return tables;
    }
  } catch (error) {
    console.error('❌ 获取房间桌子失败:', error.response?.data?.message || error.message);
    return [];
  }
}

// 测试加入桌子座位
async function testJoinTable(tableId, seatNumber) {
  try {
    console.log(`\n🧪 测试加入桌子 ${tableId} 座位 ${seatNumber}...`);
    const response = await axios.post(`${BASE_URL}/battles/tables/${tableId}/join`, {
      seatNumber: seatNumber
    }, { headers: getHeaders() });
    
    if (response.data.success) {
      console.log('✅ 成功加入座位');
      return true;
    }
  } catch (error) {
    console.error('❌ 加入座位失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试离开座位
async function testLeaveTable(tableId) {
  try {
    console.log(`\n🧪 测试离开桌子 ${tableId}...`);
    const response = await axios.post(`${BASE_URL}/battles/tables/${tableId}/leave`, {}, { headers: getHeaders() });
    
    if (response.data.success) {
      console.log('✅ 成功离开座位');
      return true;
    }
  } catch (error) {
    console.error('❌ 离开座位失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 测试离开房间
async function testLeaveRoom(roomId) {
  try {
    console.log(`\n🧪 测试离开房间 ${roomId}...`);
    const response = await axios.post(`${BASE_URL}/battles/rooms/${roomId}/leave`, {}, { headers: getHeaders() });
    
    if (response.data.success) {
      console.log('✅ 成功离开房间');
      return true;
    }
  } catch (error) {
    console.error('❌ 离开房间失败:', error.response?.data?.message || error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试战斗系统...');
  
  // 尝试登录
  await login();
  
  // 测试获取游戏房间
  const rooms = await testGetGameRooms();
  if (rooms.length === 0) {
    console.log('❌ 没有可用的房间，测试终止');
    return;
  }
  
  // 选择第一个房间进行测试
  const testRoom = rooms[0];
  console.log(`\n🎯 选择房间: ${testRoom.name} (ID: ${testRoom.id})`);
  
  // 测试进入房间
  const enterSuccess = await testEnterRoom(testRoom.id);
  if (!enterSuccess) {
    console.log('❌ 无法进入房间，测试终止');
    return;
  }
  
  // 测试获取房间桌子
  const tables = await testGetRoomTables(testRoom.id);
  if (tables.length === 0) {
    console.log('❌ 没有可用的桌子，测试终止');
    return;
  }
  
  // 选择第一张桌子进行测试
  const testTable = tables[0];
  console.log(`\n🎯 选择桌子: ${testTable.table_id} (ID: ${testTable.id})`);
  
  // 测试加入座位
  const joinSuccess = await testJoinTable(testTable.id, 1);
  if (!joinSuccess) {
    console.log('❌ 无法加入座位，测试终止');
    return;
  }
  
  // 等待2秒
  console.log('\n⏳ 等待2秒...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 测试离开座位
  await testLeaveTable(testTable.id);
  
  // 测试离开房间
  await testLeaveRoom(testRoom.id);
  
  console.log('\n🎉 战斗系统测试完成！');
}

// 运行测试
runTests().catch(error => {
  console.error('❌ 测试过程中发生错误:', error);
  process.exit(1);
}); 
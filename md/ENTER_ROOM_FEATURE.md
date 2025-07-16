# 进入房间功能实现

## 功能概述

当用户点击左侧房间列表中的房间时，系统会自动处理用户进入房间的逻辑，包括状态管理、历史记录和座位清理。

## 实现的功能

### 1. 房间人数管理
- 用户进入房间时，房间的`online_users`字段自动+1
- 检查房间是否满员，如果满员则更新房间状态

### 2. 用户状态历史记录
- 创建了新的`user_status_history`表
- 每次用户进入房间时，会复制当前用户状态记录到历史表
- 序列号自动递增，确保同一用户下的记录有序

### 3. 座位清理服务
- 检查用户当前是否占用其他座位
- 如果正在游戏中，发送结束游戏socket事件
- 自动清理用户占用的座位，更新桌子状态

## 数据库表结构

### user_status_history 表
```sql
CREATE TABLE user_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sequence_id INT NOT NULL,
  user_id INT NOT NULL,
  room_id INT,
  table_id INT,
  seat_number INT,
  status ENUM('idle', 'waiting', 'playing', 'spectating'),
  action VARCHAR(50) NOT NULL,
  action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_sequence (user_id, sequence_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action_time (action_time),
  INDEX idx_action (action)
);
```

## API接口

### Socket事件

#### 前端发送
```javascript
socket.emit('enter_room', {
  roomId: 1,    // 房间ID
  gameId: 1     // 游戏ID
});
```

#### 后端响应
```javascript
// 成功
socket.emit('enter_room_success', {
  roomId: 1,
  gameId: 1,
  room: {
    id: 1,
    name: '俄罗斯方块房间1',
    online_users: 5,
    status: '未满员'
  },
  previousTableInfo: {
    tableId: 2,
    seatNumber: 1,
    roomId: 1
  }
});

// 失败
socket.emit('enter_room_failed', {
  roomId: 1,
  message: '房间已满员'
});
```

#### 广播事件
```javascript
// 其他用户收到
socket.broadcast.emit('user_entered_room', {
  roomId: 1,
  userId: 3,
  username: 'testuser',
  action: 'entered_room'
});
```

## 使用流程

### 1. 创建数据库表
```bash
cd backend
node scripts/create-user-status-history.js
```

### 2. 启动服务器
```bash
cd backend
npm start
```

### 3. 测试功能
```bash
# 修改test-enter-room.js中的token
node test-enter-room.js
```

## 前端集成

### 房间选择处理
```javascript
const handleRoomSelect = useCallback(async (roomId) => {
  // 发送进入房间事件
  socketService.emit('enter_room', {
    roomId: parseInt(roomId),
    gameId: parseInt(gameId)
  });
  
  // 加载房间桌子数据
  await loadRoomTables(roomId);
}, [gameId]);
```

### 事件监听
```javascript
// 进入房间成功
socketService.on('enter_room_success', (data) => {
  console.log('进入房间成功:', data);
});

// 进入房间失败
socketService.on('enter_room_failed', (data) => {
  alert(`进入房间失败: ${data.message}`);
});

// 其他用户进入房间
socketService.on('user_entered_room', (data) => {
  console.log(`用户 ${data.username} 进入了房间 ${data.roomId}`);
});
```

## 日志输出示例

```
=== [userEnterRoom] 开始处理用户进入房间 ===
📥 输入参数: { userId: 3, roomId: 1 }
🔍 找到房间: 俄罗斯方块房间1 (ID: 1)
🔍 用户当前状态: { user_id: 3, room_id: 2, table_id: 4, seat_number: 2, status: 'waiting' }
🔧 创建状态历史记录，序列号: 1
✅ 状态历史记录创建成功
🔍 检查用户当前占用的座位...
🔧 用户当前占用座位: 桌子 4 座位 2
🔍 当前桌子状态: { id: 4, status: 'waiting', current_players: 1 }
🔧 清理用户座位占用...
✅ 座位清理完成
🔧 更新用户状态: { user_id: 3, room_id: 1, table_id: null, seat_number: null, status: 'idle' }
✅ 用户状态更新成功
🔧 增加房间在线用户数...
📊 房间更新后状态: { online_users: 5, max_user: 100, status: '未满员' }
✅ userEnterRoom执行完成
```

## 注意事项

1. **JWT Token**: 确保前端发送有效的JWT token进行身份验证
2. **数据库连接**: 确保数据库连接正常，表结构正确
3. **并发处理**: 系统支持多用户同时进入房间
4. **错误处理**: 所有操作都有完整的错误处理和日志记录
5. **状态一致性**: 确保用户状态、房间状态和桌子状态的一致性

## 故障排除

### 常见问题

1. **Socket连接失败**
   - 检查后端服务器是否启动
   - 检查JWT token是否有效

2. **数据库错误**
   - 检查数据库连接配置
   - 确保表结构正确

3. **状态不一致**
   - 检查日志输出
   - 验证数据库中的实际状态

### 调试方法

1. 查看后端日志输出
2. 检查数据库中的记录
3. 使用测试脚本验证功能
4. 检查前端控制台日志 
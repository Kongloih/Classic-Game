# 座位切换调试指南

## 概述

本文档说明了如何使用添加的详细日志来诊断座位切换功能的问题。

## 日志位置

### 后端日志

1. **Socket Handler** (`backend/src/socket/socketHandler.js`)
   - 位置：`join_table` 事件处理函数
   - 日志前缀：`[join_table]`
   - 包含：参数解析、房间查找、桌子查找、座位检查等

2. **Battle Service** (`backend/src/services/battleService.js`)
   - 位置：`userJoinTable` 方法
   - 日志前缀：`[userJoinTable]`
   - 包含：数据库操作、座位切换逻辑、跨桌子切换处理等

### 前端日志

1. **Game Hall Page** (`frontend/src/pages/battle/GameHallPage.js`)
   - 位置：`handleSeatClick` 方法
   - 日志前缀：`[handleSeatClick]`
   - 包含：用户点击处理、本地状态更新、socket事件发送等

2. **Socket Event Listeners** (同一文件)
   - 位置：socket事件监听器
   - 日志前缀：`[join_table_success]`, `[join_table_failed]`, `[player_joined_table]`, `[player_left_table]`
   - 包含：服务器响应处理、前端状态更新等

## 调试步骤

### 1. 启动服务并查看日志

```bash
# 启动后端服务
cd backend
npm start

# 启动前端服务
cd frontend
npm start
```

### 2. 执行测试

运行座位切换测试脚本：

```bash
# Windows
run-seat-test.bat

# 或者直接运行
node test-seat-switching.js
```

### 3. 观察日志流程

#### 前端点击座位时的日志流程：

```
=== [handleSeatClick] 开始处理座位点击 ===
📥 点击参数: { tableId: 1, seatNumber: 1 }
📥 当前用户信息: { user: 1, isAuthenticated: true }
📥 当前选中房间: 1
🔍 找到房间: { id: 1, room_id: 'room_1', name: '俄罗斯方块房间1' }
🔍 当前桌子信息: { id: 1, seats: {...}, currentPlayers: 0 }
🔍 座位切换检查: { existingSeat: null, isSeatSwitch: false, isTableSwitch: false }
🔧 准备发送socket事件: { tableId: 1, roomId: 1, seatNumber: 1, userId: 1, username: 'testuser1' }
🔧 socket连接状态: { isConnected: true, reconnectAttempts: 0, maxReconnectAttempts: 5 }
✅ socket事件已发送
🔄 更新本地状态...
🔄 更新桌子 1: { 原座位状态: {...}, 新座位状态: {...}, 原玩家数: 0, 新玩家数: 1 }
✅ 本地状态更新完成
✅ 本地操作完成，显示成功消息
=== [handleSeatClick] 处理完成 ===
```

#### 后端处理请求时的日志流程：

```
=== [join_table] 开始处理前端请求 ===
📥 收到前端参数: { tableId: 1, roomId: 1, seatNumber: 1, userId: 1, username: 'testuser1' }
📥 参数类型: { tableId: 'number', roomId: 'number', seatNumber: 'number', userId: 'number' }
🔧 解析后的参数: { parsedTableId: 1, parsedRoomId: 1, parsedSeatNumber: 1 }
🔍 开始查找房间...
🔍 通过主键查找房间结果: 找到房间 俄罗斯方块房间1 (ID: 1)
[join_table] ✅ 找到房间: 俄罗斯方块房间1 (ID: 1, room_id: room_1)
🔍 开始查找桌子...
[join_table] ✅ 找到桌子: { id: 1, table_id: 1, room_id: 1, current_players: 0, status: 'empty' }
[join_table] 🔍 检查座位字段: seat_1_user_id
[join_table] 🔍 座位当前值: null
[join_table] 🔍 当前用户ID: 1
🔍 检查用户是否已在其他座位...
[join_table] 🔍 用户当前座位检查结果: null
[join_table] 🔧 调用userJoinTable...
[join_table] 🔧 userJoinTable参数: { userId: 1, tableId: 1, seatNumber: 1 }
```

#### Battle Service处理时的日志流程：

```
=== [userJoinTable] 开始处理用户加入桌子 ===
📥 输入参数: { userId: 1, tableId: 1, seatNumber: 1 }
🔧 用户 1 加入桌子 1 座位 1
📊 桌子当前状态: { id: 1, table_id: 1, room_id: 1, current_players: 0, status: 'empty', seat_1_user_id: null, seat_2_user_id: null, seat_3_user_id: null, seat_4_user_id: null }
🔍 检查座位字段: seat_1_user_id, 当前值: null
🔍 检查用户是否已在同一张桌子的其他座位...
🔍 用户在同一张桌子的座位检查结果: null
🔍 检查用户是否在其他桌子中...
🔍 用户当前桌子信息: null
🔧 更新桌子数据: { seat_1_user_id: 1, current_players: 1, status: 'empty' }
✅ 桌子更新成功
🔧 更新用户状态: { user_id: 1, room_id: 1, table_id: 1, seat_number: 1, status: 'waiting', last_activity: 2024-01-20T10:30:00.000Z }
✅ 用户状态更新成功: 用户 1 在房间 1 桌子 1 座位 1
✅ userJoinTable执行完成，返回结果: { success: true, table: {...}, isSeatSwitch: false, isTableSwitch: false, oldSeat: null, oldTableInfo: null }
=== [userJoinTable] 处理完成 ===
```

#### 前端接收响应时的日志流程：

```
=== [join_table_success] 收到服务器成功响应 ===
📥 服务器返回数据: { tableId: 1, seatNumber: 1, userId: 1, username: 'testuser1', isSeatSwitch: false, isTableSwitch: false, oldSeat: null, oldTableInfo: null }
🔄 开始更新前端状态...
📊 当前前端状态: [{ id: 1, seats: { 1: 1, 2: null, 3: null, 4: null }, currentPlayers: 1 }]
🔄 处理当前桌子 1 的更新
✅ 当前桌子更新完成: { 原座位: { 1: 1, 2: null, 3: null, 4: null }, 新座位: { 1: 1, 2: null, 3: null, 4: null }, 原玩家数: 1, 新玩家数: 1, 是否座位切换: false, 是否跨桌子切换: false }
✅ 前端状态更新完成
```

## 常见问题诊断

### 1. 座位切换不生效

**检查点：**
- 后端日志中是否有 `isSeatSwitch: true` 或 `isTableSwitch: true`
- 前端日志中是否正确处理了 `oldSeat` 和 `oldTableInfo`
- 数据库更新是否成功（查看SQL执行日志）

### 2. 座位状态不一致

**检查点：**
- 前端本地状态更新是否正确
- 后端广播事件是否正确发送
- 其他客户端是否正确接收并更新状态

### 3. 跨桌子切换失败

**检查点：**
- 后端是否正确识别了跨桌子切换（`isTableSwitch: true`）
- 原桌子的座位是否正确释放
- 新桌子的座位是否正确占用

### 4. 数据库状态异常

**检查点：**
- 查看SQL执行日志，确认更新语句是否正确
- 检查 `battle_tables` 表中的座位字段是否正确设置为NULL
- 检查 `user_status` 表中的用户状态是否正确更新

## 测试脚本使用

运行测试脚本可以自动执行一系列座位切换操作：

```bash
node test-seat-switching.js
```

测试步骤：
1. 连接socket
2. 加入桌子1座位1
3. 切换到桌子1座位2（同桌子切换）
4. 切换到桌子2座位1（跨桌子切换）
5. 切换回桌子1座位1（跨桌子切换）

## 日志级别

- `📥` - 输入数据
- `📤` - 输出数据
- `🔧` - 处理过程
- `🔍` - 检查/查找
- `✅` - 成功
- `❌` - 失败/错误
- `🔄` - 状态更新
- `👤` - 其他用户操作

## 注意事项

1. 确保后端和前端服务都在运行
2. 检查数据库连接是否正常
3. 确保socket连接成功建立
4. 注意日志中的时间戳，确认操作顺序
5. 如果发现问题，可以对比前后端日志，找出不一致的地方 
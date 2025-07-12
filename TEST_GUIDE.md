# 🎮 多用户测试指南

## 📋 问题解决总结

### 问题1：准备状态没有更新到数据库 ✅ 已解决
- **原因**：之前只使用内存存储，服务器重启后数据丢失
- **解决方案**：创建了完整的数据库持久化系统
  - `Room` 模型：存储房间基本信息
  - `RoomPlayer` 模型：存储玩家在房间中的状态
  - `RoomService`：管理房间状态的服务层
  - 修改Socket处理器：集成数据库操作

### 问题2：游戏大厅显示虚假数据 ✅ 已解决
- **原因**：API返回模拟的demo用户数据
- **解决方案**：修改游戏大厅API，只返回真实的房间数据

## 🚀 快速开始测试

### 1. 初始化数据库
```bash
# 执行房间表初始化SQL
mysql -u root -p arcade_platform < database/room_tables.sql
```

### 2. 创建测试用户
```bash
cd backend
node scripts/create-test-users.js
```

### 3. 启动服务
```bash
# 启动后端
cd backend
npm run dev

# 启动前端（新终端）
cd frontend
npm start
```

### 4. 测试用户信息
| 用户名 | 邮箱 | 密码 |
|--------|------|------|
| player1 | player1@test.com | password123 |
| player2 | player2@test.com | password123 |

## 🧪 测试步骤

### 步骤1：登录两个用户
1. 在浏览器中打开 http://localhost:3000
2. 使用 player1 登录
3. 在另一个浏览器或隐私窗口中打开 http://localhost:3000
4. 使用 player2 登录

### 步骤2：进入游戏大厅
1. 两个用户都点击"俄罗斯方块"
2. 进入游戏大厅页面
3. **验证**：应该看到空房间，没有虚假的demo用户

### 步骤3：创建房间
1. 用户1点击任意空房间（如房间1）
2. **验证**：用户1成功进入房间，显示为房主

### 步骤4：加入房间
1. 用户2点击同一个房间
2. **验证**：用户2成功加入房间，显示为普通玩家

### 步骤5：测试准备状态
1. 用户1点击"准备"按钮
2. **验证**：用户1状态变为"已准备"
3. 用户2点击"准备"按钮
4. **验证**：用户2状态变为"已准备"，开始5秒倒计时

### 步骤6：验证数据库记录
```sql
-- 查看房间表
SELECT * FROM battle_rooms;

-- 查看房间玩家表
SELECT * FROM room_players;

-- 查看特定房间的玩家状态
SELECT rp.*, u.username 
FROM room_players rp 
JOIN users u ON rp.user_id = u.id 
WHERE rp.room_id = '1';
```

## 📊 数据库表结构

### battle_rooms 表
```sql
CREATE TABLE battle_rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  game_id INT,
  creator_id INT,
  max_players INT DEFAULT 2,
  current_players INT DEFAULT 0,
  status ENUM('waiting', 'ready', 'playing', 'finished'),
  settings JSON,
  game_data JSON,
  start_time DATETIME,
  end_time DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

### room_players 表
```sql
CREATE TABLE room_players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id VARCHAR(50),
  user_id INT,
  username VARCHAR(50),
  avatar VARCHAR(255),
  level INT DEFAULT 1,
  is_ready BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  score INT DEFAULT 0,
  lines INT DEFAULT 0,
  game_result ENUM('win', 'loss', 'draw'),
  joined_at DATETIME,
  left_at DATETIME,
  created_at DATETIME,
  updated_at DATETIME
);
```

## 🔍 调试技巧

### 1. 查看Socket连接状态
```javascript
// 在浏览器控制台
console.log('Socket状态:', socketService.getConnectionStatus());
```

### 2. 查看房间状态
```javascript
// 在房间页面控制台
console.log('房间数据:', roomData);
console.log('游戏状态:', gameState);
```

### 3. 查看后端日志
```bash
# 后端控制台会显示详细的Socket事件日志
🔧 用户 player1 尝试加入房间 1
✅ 用户 player1 成功加入游戏房间 1
🔧 用户 player1 准备
✅ 准备状态更新成功: player1 准备
```

### 4. 数据库查询
```sql
-- 查看所有活跃房间
SELECT * FROM battle_rooms WHERE status != 'finished';

-- 查看房间中的玩家
SELECT rp.*, u.username 
FROM room_players rp 
JOIN users u ON rp.user_id = u.id 
WHERE rp.left_at IS NULL;
```

## ⚠️ 常见问题

### Q1: 准备状态没有更新？
**A**: 检查数据库连接和表是否正确创建

### Q2: 游戏大厅还是显示demo用户？
**A**: 确保后端API已经更新，重启后端服务

### Q3: Socket连接失败？
**A**: 检查前端和后端的端口配置是否一致

### Q4: 数据库查询错误？
**A**: 确保已经执行了 `room_tables.sql` 脚本

## 🎯 预期结果

✅ **准备状态持久化**：点击准备后，数据库中 `room_players.is_ready` 字段会更新

✅ **真实房间数据**：游戏大厅只显示真实的房间和玩家，没有虚假数据

✅ **多用户同步**：两个用户的状态变化会实时同步

✅ **数据持久化**：服务器重启后，房间状态不会丢失

## 📝 测试报告模板

```
测试时间: _____________
测试人员: _____________

✅ 用户创建: 成功/失败
✅ 房间创建: 成功/失败  
✅ 准备状态: 成功/失败
✅ 数据持久化: 成功/失败
✅ 多用户同步: 成功/失败

问题记录:
1. ________________
2. ________________

建议改进:
1. ________________
2. ________________
``` 
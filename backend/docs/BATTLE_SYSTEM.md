# 战斗系统使用说明

## 概述

战斗系统是一个完整的房间和桌子管理系统，支持多用户实时对战。系统包含房间管理、桌子管理、座位管理和用户状态跟踪等功能。

## 数据库结构

### 核心表

1. **battle_rooms** - 房间表
   - 每个游戏最多3个房间（room_1, room_2, room_3）
   - 房间状态：未满员/满员
   - 跟踪在线用户数量
   - 最大容纳用户数：500人

2. **battle_tables** - 游戏桌表
   - 每个房间最多50张桌子（table_1 到 table_50）
   - 每张桌子最多4个座位
   - 桌子状态：empty/waiting/playing/finished

3. **user_status** - 用户状态表
   - 跟踪用户当前所在房间、桌子和座位
   - 记录用户最后活动时间
   - 支持超时自动清理

## 初始化系统

### 1. 运行初始化脚本

```bash
cd backend
node scripts/init-battle-system.js
```

这将：
- 为每个游戏创建3个房间
- 为每个房间创建50张桌子
- 设置正确的表结构和索引

### 2. 验证初始化结果

```bash
node scripts/test-battle-system.js
```

## API接口

### 房间管理

#### 获取游戏房间列表
```
GET /api/battles/rooms/:gameId
```

#### 进入房间
```
POST /api/battles/rooms/:roomId/enter
```

#### 离开房间
```
POST /api/battles/rooms/:roomId/leave
```

### 桌子管理

#### 获取房间桌子列表
```
GET /api/battles/tables/:roomId
```

#### 加入桌子座位
```
POST /api/battles/tables/:tableId/join
{
  "seatNumber": 1
}
```

#### 离开桌子座位
```
POST /api/battles/tables/:tableId/leave
```

#### 开始游戏
```
POST /api/battles/tables/:tableId/start
```

### 用户状态

#### 获取用户状态
```
GET /api/battles/user/status
```

## 业务逻辑

### 房间状态管理

- **未满员**：在线用户 < max_user（默认500）
- **满员**：在线用户 >= max_user（默认500）

### 桌子状态管理

- **empty**：没有玩家或只有1个玩家
- **waiting**：2-3个玩家，等待开始
- **playing**：游戏进行中
- **finished**：游戏结束

### 座位管理

- 每个座位只能被一个用户占用
- 用户只能同时在一个座位
- 座位号：1, 2, 3, 4

### 超时处理

- 用户3分钟无活动自动踢出座位
- 系统每30秒检查一次超时用户
- 每小时清理过期用户状态记录

## 前端集成

### 房间列表显示

```javascript
// 获取游戏房间
const response = await axios.get('/api/battles/rooms/2');
const rooms = response.data.data;

// 显示房间列表
rooms.forEach(room => {
  console.log(`${room.name}: ${room.status}, 在线: ${room.online_users}`);
});
```

### 桌子显示

```javascript
// 获取房间桌子
const response = await axios.get('/api/battles/tables/1');
const tables = response.data.data;

// 显示桌子状态
tables.forEach(table => {
  const occupiedSeats = Object.values(table.seats).filter(user => user !== null).length;
  console.log(`${table.table_id}: ${occupiedSeats}/${table.max_players} 玩家`);
});
```

### 加入座位

```javascript
// 加入座位
await axios.post('/api/battles/tables/1/join', {
  seatNumber: 1
});
```

## 监控和维护

### 查看系统状态

```sql
-- 查看房间状态
SELECT * FROM battle_rooms WHERE game_id = 2;

-- 查看桌子状态
SELECT * FROM battle_tables WHERE room_id = 1;

-- 查看用户状态
SELECT * FROM user_status WHERE status != 'idle';
```

### 清理数据

```sql
-- 清理超时用户
DELETE FROM user_status 
WHERE last_activity < DATE_SUB(NOW(), INTERVAL 3 MINUTE)
AND status IN ('waiting', 'playing');
```

## 故障排除

### 常见问题

1. **房间显示为空**
   - 检查是否运行了初始化脚本
   - 确认games表中有游戏数据

2. **无法加入座位**
   - 检查座位是否已被占用
   - 确认用户不在其他座位

3. **用户状态不同步**
   - 检查定时清理任务是否正常运行
   - 手动清理超时用户

### 日志查看

```bash
# 查看服务器日志
tail -f backend/logs/app.log

# 查看清理任务日志
grep "清理" backend/logs/app.log
```

## 扩展功能

### 添加新游戏

1. 在games表中添加游戏记录
2. 运行初始化脚本创建房间和桌子
3. 更新前端游戏选择页面

### 修改房间数量

1. 修改初始化脚本中的房间数量
2. 重新运行初始化脚本
3. 更新前端显示逻辑

### 修改座位数量

1. 修改BattleTable模型
2. 更新数据库表结构
3. 修改前端座位显示

## 性能优化

### 数据库优化

- 为常用查询字段添加索引
- 定期清理过期数据
- 使用连接池管理数据库连接

### 缓存优化

- 缓存房间和桌子状态
- 使用Redis存储实时数据
- 实现数据预加载

### 监控指标

- 房间使用率
- 桌子占用率
- 用户在线时长
- 系统响应时间 
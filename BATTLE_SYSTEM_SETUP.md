# 战斗系统设置指南

## 问题解决

您遇到的错误是因为：
1. 后端服务器未启动
2. battle_rooms 和 battle_tables 表未初始化
3. 缺少游戏大厅API接口

## 解决步骤

### 1. 执行数据库初始化脚本

在MySQL中执行以下SQL脚本：

```sql
-- 方法1：使用我提供的脚本
source database/init-battle-system.sql

-- 方法2：或者使用完整的初始化脚本
source database/create-tables.sql
```

### 2. 验证数据是否创建成功

执行以下查询验证：

```sql
-- 检查房间数据
SELECT 
  g.name as game_name,
  br.room_id,
  br.name as room_name,
  br.online_users,
  br.current_tables
FROM battle_rooms br
JOIN games g ON br.game_id = g.id
ORDER BY g.sort_order, br.room_id;

-- 检查桌子数据
SELECT 
  COUNT(*) as total_tables,
  COUNT(CASE WHEN status = 'empty' THEN 1 END) as empty_tables,
  COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting_tables,
  COUNT(CASE WHEN status = 'playing' THEN 1 END) as playing_tables
FROM battle_tables;
```

### 3. 启动后端服务器

```bash
cd backend
npm run dev
```

### 4. 测试API接口

启动服务器后，可以测试以下API：

```bash
# 获取游戏大厅数据
curl http://localhost:5000/api/games/hall/1

# 获取用户状态
curl http://localhost:5000/api/games/hall/user/status
```

## 数据库结构说明

### battle_rooms 表
- 每个游戏3个房间（room_1, room_2, room_3）
- 每个房间最大500人
- 每个房间50张桌子

### battle_tables 表
- 每张桌子4个座位（seat_1_user_id 到 seat_4_user_id）
- 座位状态：empty, waiting, playing, finished
- 当前玩家数量跟踪

### user_status 表
- 用户当前位置跟踪
- 房间ID、桌子ID、座位号
- 用户状态：idle, waiting, playing, spectating

## API接口说明

### 1. 获取游戏大厅数据
```
GET /api/games/hall/:gameId
```

返回数据：
```json
{
  "success": true,
  "data": {
    "game": { ... },
    "rooms": [ ... ],
    "tables": [ ... ],
    "userStatus": { ... }
  }
}
```

### 2. 加入桌子座位
```
POST /api/games/hall/tables/:tableId/join
{
  "seatNumber": 1
}
```

### 3. 离开桌子座位
```
POST /api/games/hall/tables/:tableId/leave
```

### 4. 获取用户状态
```
GET /api/games/hall/user/status
```

## 前端集成

前端已经配置了以下路由：
- `/battle/hall/:gameId` - 游戏大厅页面
- `/test/hall` - 测试页面

## 测试流程

1. **执行SQL脚本**：初始化数据库
2. **启动后端**：`npm run dev`
3. **启动前端**：`npm start`
4. **访问测试页面**：`http://localhost:3000/test/hall`
5. **选择游戏**：进入对应游戏大厅
6. **测试功能**：点击座位、切换房间

## 常见问题

### 1. 连接被拒绝
```
ERR_CONNECTION_REFUSED
```
**解决方案**：确保后端服务器已启动

### 2. 表不存在
```
Table 'battle_rooms' doesn't exist
```
**解决方案**：执行数据库初始化脚本

### 3. 数据为空
```
rooms: [], tables: []
```
**解决方案**：检查游戏数据是否存在，执行初始化脚本

### 4. API 404错误
```
GET /api/games/hall/1 404
```
**解决方案**：确保路由已正确注册

## 验证清单

- [ ] 数据库表已创建
- [ ] 房间数据已初始化
- [ ] 桌子数据已初始化
- [ ] 后端服务器已启动
- [ ] API接口可访问
- [ ] 前端页面可加载
- [ ] 座位点击功能正常

## 下一步

完成以上步骤后，您就可以：
1. 在游戏大厅中选择房间
2. 点击桌子座位加入游戏
3. 测试多人对战功能
4. 开发更多游戏功能

如果还有问题，请检查：
- 数据库连接配置
- 服务器日志输出
- 浏览器控制台错误
- API响应状态 
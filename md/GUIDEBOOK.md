# 🎮 经典街机游戏平台 - 完整调用指南

## 📋 目录
- [项目概述](#项目概述)
- [环境要求](#环境要求)
- [快速启动](#快速启动)
- [开发模式](#开发模式)
- [生产部署](#生产部署)
- [API文档](#api文档)
- [Socket事件](#socket事件)
- [测试工具](#测试工具)
- [故障排除](#故障排除)

---

## 🎯 项目概述

这是一个经典街机游戏平台，包含俄罗斯方块、贪吃蛇、打砖块等游戏，支持在线对战、排行榜、社交功能等。

### 技术栈
- **前端**: React + Redux + Material-UI + Socket.IO
- **后端**: Node.js + Express + Socket.IO + MySQL + Redis
- **部署**: Docker + Docker Compose

---

## 🔧 环境要求

### 必需软件
- **Node.js** 18.0+ ([下载](https://nodejs.org/))
- **Docker** 20.10+ ([下载](https://www.docker.com/get-started))
- **Git** ([下载](https://git-scm.com/))

### 检查版本
```bash
node --version     # 应该显示 v18.x.x 或更高
docker --version   # 应该显示 20.10.x 或更高
git --version      # 应该显示版本信息
```

---

## 🚀 快速启动

### 1. 克隆项目
```bash
git clone <repository-url>
cd classic-game
```

### 2. 一键启动（推荐）
```bash
# 安装所有依赖
npm run install:all

# 启动完整开发环境
npm run dev
```

### 3. 访问应用
- 🎮 **前端应用**: http://localhost:3000
- 🔧 **后端API**: http://localhost:5000
- 📚 **API文档**: http://localhost:5000/api-docs

---

## 💻 开发模式

### 前端开发

#### 启动前端服务
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

#### 前端可用命令
```bash
npm start          # 启动开发服务器
npm run build      # 构建生产版本
npm test           # 运行测试
npm run eject      # 弹出配置（不可逆）
```

#### 前端环境变量
创建 `frontend/.env` 文件：
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

### 后端开发

#### 启动后端服务
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

#### 后端可用命令
```bash
npm run dev        # 启动开发服务器
npm start          # 启动生产服务器
npm test           # 运行测试
npm run db:migrate # 数据库迁移
npm run db:seed    # 填充测试数据
```

#### 后端环境变量
创建 `backend/.env` 文件：
```env
# 服务器配置
PORT=5000
SOCKET_PORT=5000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=arcade_platform
DB_USER=arcade_user
DB_PASSWORD=arcade_pass

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123456

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

### 数据库配置

#### 使用Docker启动数据库
```bash
# 启动数据库服务
npm run docker:dev

# 或者直接使用docker-compose
docker-compose up -d mysql redis
```

#### 数据库初始化
```bash
# 运行数据库迁移
npm run db:migrate

# 填充测试数据
npm run db:seed
```

---

## 🐳 Docker部署

### 开发环境
```bash
# 启动所有服务
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

### 生产环境
```bash
# 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 停止服务
docker-compose -f docker-compose.prod.yml down
```

---

## 📚 API文档

### 认证相关 API

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123",
  "phone": "13800138000",
  "verificationCode": "123456",
  "gender": "male",
  "birthYear": 1990
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "testuser",
  "password": "Password123",
  "remember_me": false
}
```

#### 刷新令牌
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### 游戏相关 API

#### 获取游戏列表
```http
GET /api/games?category=classic&featured=true&limit=10
```

#### 获取游戏大厅
```http
GET /api/games/hall/1?testMode=true
Authorization: Bearer your-token
```

#### 获取用户游戏统计
```http
GET /api/games/stats/1
Authorization: Bearer your-token
```

### 用户相关 API

#### 获取用户信息
```http
GET /api/users/profile
Authorization: Bearer your-token
```

#### 更新用户信息
```http
PUT /api/users/profile
Authorization: Bearer your-token
Content-Type: application/json

{
  "nickname": "新昵称",
  "avatar": "avatar-url"
}
```

### 社交相关 API

#### 获取好友列表
```http
GET /api/social/friends
Authorization: Bearer your-token
```

#### 发送好友请求
```http
POST /api/social/friends/request
Authorization: Bearer your-token
Content-Type: application/json

{
  "targetUserId": 2
}
```

---

## 🔌 Socket事件

### 连接配置
```javascript
// 前端连接
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket', 'polling']
});

// 测试模式连接
const socket = io('http://localhost:5000', {
  auth: { testMode: true },
  query: { testMode: 'true' }
});
```

### 客户端事件（发送）

#### 加入游戏房间
```javascript
socket.emit('join_game_room', {
  roomId: '1',
  gameType: '俄罗斯方块'
});
```

#### 准备状态
```javascript
socket.emit('player_ready', {
  roomId: '1',
  isReady: true
});
```

#### 开始游戏
```javascript
socket.emit('start_game', {
  roomId: '1'
});
```

#### 游戏数据更新
```javascript
socket.emit('game_update', {
  roomId: '1',
  score: 1000,
  lines: 5,
  level: 2
});
```

#### 游戏结束
```javascript
socket.emit('game_over', {
  roomId: '1',
  finalScore: 5000,
  result: 'win'
});
```

#### 聊天消息
```javascript
socket.emit('chat_message', {
  roomId: '1',
  message: '大家好！'
});
```

### 服务器事件（接收）

#### 房间信息
```javascript
socket.on('room_info', (data) => {
  console.log('房间信息:', data);
  // data: { roomId, gameType, players, gameState }
});
```

#### 玩家加入
```javascript
socket.on('player_joined_game', (data) => {
  console.log('玩家加入:', data);
  // data: { playerId, playerName, avatar, level, isHost }
});
```

#### 准备状态更新
```javascript
socket.on('player_ready_status', (data) => {
  console.log('准备状态:', data);
  // data: { playerId, playerName, isReady }
});
```

#### 所有玩家准备
```javascript
socket.on('all_players_ready', (data) => {
  console.log('所有玩家准备:', data);
  // data: { roomId, countdown }
});
```

#### 游戏开始
```javascript
socket.on('game_started', (data) => {
  console.log('游戏开始:', data);
  // data: { roomId, startTime }
});
```

#### 游戏结束
```javascript
socket.on('game_finished', (data) => {
  console.log('游戏结束:', data);
  // data: { roomId, results }
});
```

---

## 🧪 测试工具

### 房间加入测试
```bash
node test-room-join.js
```

### 准备状态测试
```bash
node test-ready-status.js
```

### 自动化测试
```bash
# 运行所有测试
npm run test

# 运行前端测试
npm run frontend:test

# 运行后端测试
npm run backend:test
```

### 数据库测试
```bash
# 创建测试用户
cd backend
node scripts/create-test-user.js
```

---

## 🔍 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# 杀死占用进程
taskkill /PID <进程ID> /F     # Windows
kill -9 <进程ID>              # Mac/Linux
```

#### 2. 数据库连接失败
```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 查看MySQL日志
docker-compose logs mysql

# 手动连接测试
docker-compose exec mysql mysql -u arcade_user -p arcade_platform
```

#### 3. Socket连接失败
```bash
# 检查Socket服务状态
netstat -ano | findstr :5000

# 查看后端日志
docker-compose logs backend

# 测试Socket连接
node test-room-join.js
```

#### 4. 前端编译错误
```bash
# 清理node_modules
cd frontend
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本
node --version  # 应该是18.0+
```

#### 5. 依赖安装失败
```bash
# 清理npm缓存
npm cache clean --force

# 使用yarn替代npm
yarn install

# 检查网络连接
npm config get registry
```

### 日志查看

#### 前端日志
```bash
# 浏览器开发者工具
F12 -> Console

# 查看React错误
F12 -> Console -> 查看红色错误信息
```

#### 后端日志
```bash
# 查看实时日志
docker-compose logs -f backend

# 查看特定服务的日志
docker-compose logs backend | grep ERROR
```

#### 数据库日志
```bash
# 查看MySQL日志
docker-compose logs mysql

# 查看Redis日志
docker-compose logs redis
```

### 性能优化

#### 前端优化
```bash
# 构建生产版本
cd frontend
npm run build

# 分析包大小
npm install -g webpack-bundle-analyzer
npm run build -- --analyze
```

#### 后端优化
```bash
# 启用压缩
npm install compression

# 启用缓存
npm install redis

# 性能监控
npm install express-rate-limit
```

---

## 📞 技术支持

### 联系方式
- **GitHub Issues**: [项目Issues页面]
- **邮箱**: support@arcade-platform.com
- **文档**: [项目Wiki页面]

### 贡献指南
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🎉 更新日志

### v1.0.0 (2024-01-01)
- ✨ 初始版本发布
- 🎮 支持俄罗斯方块、贪吃蛇、打砖块
- 👥 在线对战功能
- 📊 排行榜系统
- 💬 聊天功能
- 🔐 用户认证系统

---

**最后更新**: 2024年1月1日  
**版本**: v1.0.0  
**维护者**: 经典游戏平台开发团队 
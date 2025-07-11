# 🎮 经典街机游戏平台

一个现代化的经典街机游戏平台，支持多人在线对战、实时聊天、排行榜等功能。

## ✨ 主要功能

### 🎯 核心功能
- **多人在线对战**：支持实时对战，WebSocket连接
- **经典游戏集合**：俄罗斯方块、贪吃蛇、打砖块等
- **用户系统**：注册、登录、个人资料管理
- **排行榜系统**：全球排行榜、游戏排行榜
- **社交功能**：好友系统、聊天功能
- **手机验证**：SMS验证码注册

### 🎮 游戏特性
- **实时对战**：WebSocket实时通信
- **游戏大厅**：50个游戏桌，实时显示在线玩家
- **房间系统**：创建、加入、观看游戏房间
- **游戏统计**：分数、等级、胜率统计
- **游戏回放**：支持游戏回放功能

### 🔧 技术特性
- **真实API**：连接后端数据库，实时用户数据
- **WebSocket**：实时通信，在线状态管理
- **响应式设计**：适配桌面和移动设备
- **Material-UI**：现代化UI组件库
- **Redux状态管理**：全局状态管理
- **JWT认证**：安全的用户认证系统

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **Material-UI** - UI组件库
- **Redux Toolkit** - 状态管理
- **React Router** - 路由管理
- **Socket.IO Client** - WebSocket客户端
- **Axios** - HTTP客户端

### 后端
- **Node.js** - 服务器运行环境
- **Express.js** - Web框架
- **Socket.IO** - WebSocket服务器
- **Sequelize** - ORM数据库操作
- **MySQL** - 主数据库
- **Redis** - 缓存和会话存储
- **JWT** - 用户认证
- **bcrypt** - 密码加密

### 数据库
- **MySQL 8.0** - 主数据库
- **Redis 7** - 缓存和会话

## 🚀 快速开始

### 环境要求
- **Node.js** 18.0+
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**

### 一键启动（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd classic-game

# 启动开发环境
./run-dev.bat  # Windows
# 或
./run-dev.sh   # Linux/Mac

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:5000
```

### 手动启动

```bash
# 1. 启动数据库服务
docker-compose -f docker-compose.dev.yml up -d mysql redis

# 2. 安装依赖
npm install
cd backend && npm install
cd ../frontend && npm install

# 3. 配置环境变量
cp backend/env.template backend/.env
cp frontend/env.template frontend/.env

# 4. 启动后端服务
cd backend && npm run dev

# 5. 启动前端服务（新终端）
cd frontend && npm start
```

## 📊 数据库结构

### 主要数据表
- **users** - 用户信息表
- **games** - 游戏信息表
- **game_records** - 游戏记录表
- **friendships** - 好友关系表
- **battle_rooms** - 对战房间表

### 用户数据字段
```sql
-- 用户基本信息
username, email, password, nickname, avatar
-- 游戏相关
level, experience, coins, diamonds
-- 游戏统计
total_games, total_wins, total_losses, highest_score
-- 在线状态
last_login_at, last_login_ip, login_count
```

## 🔌 API接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/send-sms` - 发送短信验证码
- `GET /api/auth/status` - 检查认证状态

### 游戏相关
- `GET /api/games/hall/:gameId` - 获取游戏大厅数据
- `GET /api/games/online-users` - 获取在线用户列表
- `GET /api/games/stats/:userId` - 获取用户游戏统计

### 对战相关
- `POST /api/battle/rooms` - 创建对战房间
- `GET /api/battle/rooms` - 获取房间列表
- `POST /api/battle/rooms/:roomId/join` - 加入房间

## 🔄 WebSocket事件

### 连接事件
- `connect` - 连接成功
- `disconnect` - 连接断开
- `user_online` - 用户上线
- `user_offline` - 用户下线

### 游戏房间事件
- `join_game_room` - 加入游戏房间
- `player_joined_game` - 玩家加入房间
- `player_ready` - 玩家准备状态
- `all_players_ready` - 所有玩家准备完成
- `game_started` - 游戏开始
- `game_update` - 游戏数据更新
- `game_over` - 游戏结束

### 聊天事件
- `chat_message` - 发送聊天消息
- `new_message` - 接收新消息

## 🧪 测试

### 运行测试
```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test

# 端到端测试
npm run test:e2e
```

### 测试覆盖率
```bash
# 生成测试覆盖率报告
npm run test:coverage
```

## 📁 项目结构

```
classic-game/
├── 📱 frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/         # React组件
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API和WebSocket服务
│   │   ├── store/             # Redux状态管理
│   │   └── styles/            # 样式文件
│   └── public/                # 静态资源
├── 🔧 backend/                 # Node.js后端服务
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   ├── middleware/        # 中间件
│   │   ├── models/            # 数据模型
│   │   ├── routes/            # API路由
│   │   ├── services/          # 业务服务
│   │   └── socket/            # WebSocket处理
│   └── tests/                 # 后端测试
├── 🗄️ database/               # 数据库脚本
├── 📚 docs/                   # 文档
└── 🐳 docker-compose.yml      # Docker配置
```

## 🔐 安全特性

### 用户认证
- **JWT Token** - 无状态认证
- **密码加密** - bcrypt哈希加密
- **Token刷新** - 自动刷新机制
- **会话管理** - Redis存储会话

### 数据安全
- **输入验证** - 请求参数验证
- **SQL注入防护** - Sequelize ORM
- **XSS防护** - 内容安全策略
- **CORS配置** - 跨域请求控制

## 📈 性能优化

### 前端优化
- **代码分割** - React.lazy动态导入
- **缓存策略** - 静态资源缓存
- **图片优化** - 响应式图片
- **Bundle优化** - 代码压缩

### 后端优化
- **数据库索引** - 查询性能优化
- **Redis缓存** - 热点数据缓存
- **连接池** - 数据库连接管理
- **负载均衡** - 多实例部署

## 🚀 部署

### 生产环境部署
```bash
# 构建生产版本
docker-compose -f docker-compose.prod.yml up -d --build

# 访问生产环境
# https://your-domain.com
```

### 环境变量配置
```bash
# 生产环境变量
NODE_ENV=production
DB_HOST=your-db-host
REDIS_HOST=your-redis-host
JWT_SECRET=your-secret-key
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目主页: [GitHub Repository](https://github.com/your-username/classic-game)
- 问题反馈: [Issues](https://github.com/your-username/classic-game/issues)
- 邮箱: your-email@example.com

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**注意**: 这是一个开发中的项目，某些功能可能仍在开发中。请查看 [CHANGELOG](CHANGELOG.md) 了解最新更新。 
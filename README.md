# 经典街机游戏平台

一个现代化的经典街机游戏平台，支持俄罗斯方块、贪吃蛇、打砖块等经典游戏，具备实时对战、排行榜、社交功能等特性。

## 🚀 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### 一键启动（推荐）
```bash
# Windows
start-multi-user-test.bat

# Linux/Mac
./start-multi-user-test.sh
```

### 手动启动
```bash
# 1. 安装依赖
npm install
cd frontend && npm install
cd ../backend && npm install

# 2. 创建测试用户
cd backend
node scripts/create-test-users.js

# 3. 启动后端
npm run dev

# 4. 启动前端
cd ../frontend
npm start
```

## 🔐 认证系统

**重要更新：系统现在强制要求真实用户认证**

- ❌ 移除了演示登录功能
- ❌ 移除了测试模式绕过
- ✅ 强制要求用户注册和登录
- ✅ 所有功能都需要有效token

### 测试用户
系统提供两个测试用户账户：

| 用户名 | 邮箱 | 密码 |
|--------|------|------|
| player1 | player1@test.com | password123 |
| player2 | player2@test.com | password123 |

### 多用户测试
1. 在两个不同的浏览器或隐私窗口中分别登录不同用户
2. 进入同一个游戏房间
3. 测试实时对战功能

## 🎮 游戏功能

### 支持的游戏
- 🟦 俄罗斯方块 (Tetris)
- 🐍 贪吃蛇 (Snake)
- 🧱 打砖块 (Breakout)
- 🔢 2048
- 💣 扫雷 (Minesweeper)
- ⭕ 五子棋 (Gomoku)

### 核心特性
- 实时多人对战
- 排行榜系统
- 用户等级和经验
- 社交功能（好友、公会）
- 游戏统计和成就

## 🏗️ 技术架构

### 后端技术栈
- **Node.js** + **Express.js**
- **Socket.IO** (实时通信)
- **Sequelize** (ORM)
- **MySQL** (主数据库)
- **Redis** (缓存和会话)
- **JWT** (身份认证)

### 前端技术栈
- **React 18** + **TypeScript**
- **Material-UI** (UI组件库)
- **Redux Toolkit** (状态管理)
- **Socket.IO Client** (实时通信)
- **React Router** (路由管理)

## 📁 项目结构

```
classic-game/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # API路由
│   │   ├── services/       # 业务服务
│   │   └── socket/         # Socket处理
│   └── scripts/            # 工具脚本
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API服务
│   │   ├── store/          # Redux状态
│   │   └── styles/         # 样式文件
│   └── public/             # 静态资源
└── docs/                   # 文档
```

## 🔧 开发指南

### API文档
- 后端API: http://localhost:5000/api-docs
- Socket事件: 参考 `docs/API.md`

### 数据库
```bash
# 初始化数据库
mysql -u root -p < database/init.sql

# 创建测试用户
node backend/scripts/create-test-users.js
```

### 环境变量
复制并配置环境变量文件：
```bash
# 后端
cp backend/env.template backend/.env

# 前端
cp frontend/env.template frontend/.env
```

## 🧪 测试

### 单元测试
```bash
# 后端测试
cd backend && npm test

# 前端测试
cd frontend && npm test
```

### 集成测试
```bash
# 运行完整测试套件
npm run test:all
```

## 🚀 部署

### Docker部署
```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 手动部署
参考 `docs/DEPLOYMENT.md` 和 `docs/PRODUCTION_DEPLOYMENT.md`

## 📊 监控和日志

- 应用日志: `logs/`
- 性能监控: 集成Prometheus + Grafana
- 错误追踪: 集成Sentry

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 支持

- 📧 邮箱: support@classicgame.com
- 💬 讨论: [GitHub Discussions](https://github.com/your-repo/discussions)
- 🐛 问题: [GitHub Issues](https://github.com/your-repo/issues)

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！ 
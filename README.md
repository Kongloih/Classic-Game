# 经典街机游戏平台

一个集成经典街机游戏的在线对战平台，提供怀旧游戏体验和社交互动功能。

## 🎮 项目简介

**目标用户**：80、90后怀旧玩家，轻度游戏爱好者，寻找社交互动的年轻群体

**核心功能**：
- ✅ 经典街机游戏集合展示
- ✅ 在线实时对战系统（游戏大厅）
- 🔄 社交互动功能（好友、公会）
- 🔄 云存档同步
- 🔄 成就系统和排行榜

## 🏗️ 技术架构

### 后端技术栈
- **服务器**：Node.js + Express.js
- **实时通信**：Socket.IO
- **数据库**：MySQL + Redis
- **身份验证**：JWT + OAuth 2.0
- **容器化**：Docker + Kubernetes

### 前端技术栈
- **Web端**：React + Redux + Material-UI
- **移动端**：React Native（计划中）
- **游戏引擎**：Unity（游戏兼容性处理）
- **实时通信**：WebRTC

## 📁 项目结构

```
classic program/
├── backend/                 # 后端API服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由
│   │   ├── services/       # 业务逻辑
│   │   └── server.js       # 服务器入口
│   ├── Dockerfile.dev      # 开发环境Docker配置
│   ├── package.json
│   └── env.template        # 环境变量模板
├── frontend/               # 前端Web应用
│   ├── public/
│   ├── src/
│   │   ├── components/     # React组件
│   │   │   ├── auth/       # 认证组件
│   │   │   ├── common/     # 通用组件
│   │   │   └── layout/     # 布局组件
│   │   ├── pages/          # 页面组件
│   │   │   ├── auth/       # 认证页面
│   │   │   ├── games/      # 游戏相关页面
│   │   │   ├── battle/     # 对战页面
│   │   │   ├── social/     # 社交页面
│   │   │   └── user/       # 用户页面
│   │   ├── store/          # Redux状态管理
│   │   │   └── slices/     # Redux切片
│   │   ├── services/       # API服务
│   │   ├── theme/          # 主题配置
│   │   └── styles/         # 样式文件
│   ├── Dockerfile.dev      # 开发环境Docker配置
│   └── package.json
├── database/               # 数据库脚本
│   └── init.sql           # 数据库初始化脚本
├── docs/                   # 项目文档
│   ├── API.md             # API文档
│   └── DEPLOYMENT.md      # 部署文档
├── docker-compose.yml      # Docker编排配置
├── docker-compose.dev.yml  # 开发环境Docker编排
└── README.md
```

## 🚀 当前开发状态

### ✅ 已完成功能

#### 前端系统
- [x] **项目基础架构**
  - React + Redux + Material-UI 框架搭建
  - 路由系统和状态管理
  - 响应式布局和主题系统
  - 错误边界和加载组件

- [x] **用户界面组件**
  - 头部导航栏（Header）
  - 侧边栏导航（Sidebar）
  - 底部版权信息（Footer）
  - 加载动画和错误处理

- [x] **游戏大厅系统** 🎯
- **游戏选择页面**：展示6款经典游戏（俄罗斯方块、贪吃蛇、打砖块、2048、扫雷、五子棋）
- **游戏大厅页面**：50个游戏桌的网格布局，支持过滤和排序
- **对战房间页面**：玩家准备系统、倒计时、游戏设置
- **游戏游玩页面**：游戏画布、分数系统、控制面板

- [x] **俄罗斯方块网络对战** 🎯
- **完整游戏逻辑**：7种经典方块形状，旋转、移动、快速下落
- **实时对战系统**：Socket.IO实时通信，对手游戏板同步显示
- **准备机制**：玩家准备状态，双方准备后开始游戏
- **分数系统**：消除行数计算，等级提升，难度递增
- **游戏结束**：方块堆叠到顶部的结束判定
- **重新开始**：游戏结束后可重新开始新对局

- [x] **页面路由系统**
  - 首页展示
  - 游戏相关路由
  - 用户认证路由
  - 社交功能路由
  - 404错误页面

#### 后端系统
- [x] **基础架构**
  - Express.js 服务器搭建
  - 数据库连接配置（MySQL）
  - Redis缓存配置
  - 中间件系统

- [x] **数据库设计**
  - 用户表结构
  - 游戏表结构
  - 初始化SQL脚本

- [x] **API路由**
  - 用户认证路由
  - 游戏相关路由
  - 社交功能路由
  - 对战系统路由

### 🔄 进行中功能
- [ ] 用户认证系统完善
- [ ] Socket.IO实时通信
- [ ] 游戏逻辑实现

### 📋 待开发功能
- [ ] 社交功能（好友、公会）
- [ ] 云存档同步
- [ ] 成就系统和排行榜
- [ ] 移动端应用

## 🎮 游戏大厅系统详解

### 核心功能

#### 1. 游戏选择页面 (`/games`)
- **游戏展示**：6款经典游戏卡片展示
- **游戏信息**：名称、描述、难度、类别、评分、在线玩家数
- **交互功能**：点击直接进入对应游戏大厅

#### 2. 游戏大厅页面 (`/games/:gameId/hall`)
- **50个游戏桌**：网格布局，每个桌子最多2人
- **状态管理**：空桌、等待中、已满三种状态
- **过滤排序**：按状态过滤，按人数或分数排序
- **实时统计**：在线玩家数、活跃房间数、最高分

#### 3. 对战房间页面 (`/battle/room/:roomId`)
- **玩家管理**：头像、用户名、分数显示
- **准备系统**：准备/取消准备功能
- **倒计时**：5秒游戏开始倒计时
- **房间功能**：聊天、设置、离开房间

#### 4. 游戏游玩页面 (`/play/:gameId`)
- **游戏界面**：黑色画布，实时分数显示
- **控制系统**：暂停、继续、结束、重新开始
- **状态显示**：等级、时间、分数
- **操作说明**：键盘快捷键提示

### 技术特点
- **响应式设计**：适配桌面和移动设备
- **Material-UI**：现代化UI组件库
- **Redux状态管理**：全局状态管理
- **React Hooks**：函数式组件和状态管理
- **路由系统**：完整的页面导航

## 🛠️ 快速开始

### 环境要求
- Node.js >= 18.0.0
- MySQL >= 8.0
- Redis >= 6.0（可选）
- Docker & Docker Compose（可选）

### 本地开发

#### 方法一：使用Docker（推荐）
```bash
# 克隆项目
git clone <repository-url>
cd classic program

# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:5000
```

#### 方法二：本地开发
```bash
# 克隆项目
git clone <repository-url>
cd classic program

# 后端设置
cd backend
npm install
cp env.template .env
# 编辑 .env 文件配置数据库连接
npm run dev

# 前端设置（新终端）
cd ../frontend
npm install
npm start
```

### 数据库初始化
```bash
# 创建数据库和用户
mysql -u root -p
CREATE DATABASE classic_games;
CREATE USER 'gameuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON classic_games.* TO 'gameuser'@'localhost';
FLUSH PRIVILEGES;

# 执行初始化脚本
mysql -u gameuser -p classic_games < database/init.sql
```

## 🎯 使用指南

### 游戏大厅使用流程
1. **访问首页**：打开 `http://localhost:3000`
2. **选择游戏**：点击"游戏大厅"或首页游戏卡片
3. **进入大厅**：选择喜欢的游戏，进入对应游戏大厅
4. **选择房间**：在50个游戏桌中选择空桌或等待中的桌子
5. **加入游戏**：点击"加入"按钮，进入对战房间
6. **准备游戏**：点击"准备"按钮，等待其他玩家
7. **开始游戏**：所有玩家准备后，房主可开始游戏
8. **游戏体验**：进入游戏游玩页面，享受经典游戏

### 游戏控制
- **键盘控制**：方向键移动，空格键特殊操作
- **快捷键**：ESC暂停游戏
- **鼠标操作**：点击按钮和界面元素

## 📚 API文档

### 后端API端点
- `GET /api/auth/status` - 检查认证状态
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/games` - 获取游戏列表
- `GET /api/games/:id` - 获取游戏详情
- `GET /api/battle/rooms` - 获取对战房间列表
- `POST /api/battle/rooms` - 创建对战房间

详细API文档请参考 `docs/API.md`

## 🐛 故障排除

### 常见问题

#### 前端启动失败
```bash
# 检查Node.js版本
node --version  # 需要 >= 18.0.0

# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 后端数据库连接失败
```bash
# 检查MySQL服务状态
sudo systemctl status mysql

# 检查数据库连接配置
cat backend/.env
```

#### Redis连接问题
```bash
# 如果Redis未安装，可以暂时跳过
# 修改 backend/src/config/redis.js 中的配置
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 使用ESLint和Prettier保持代码风格一致
- 遵循React Hooks最佳实践
- 组件使用TypeScript类型定义（计划中）
- 提交信息使用约定式提交格式

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 开发团队

- 项目负责人：[你的名字]
- 后端开发：[团队成员]
- 前端开发：[团队成员]
- 游戏设计：[团队成员]

## 🎉 项目亮点

- **🎮 经典游戏集合**：集成多款经典街机游戏
- **🏟️ 游戏大厅系统**：50个游戏桌的多人对战平台
- **⚡ 实时对战**：Socket.IO实时通信
- **📱 响应式设计**：完美适配各种设备
- **🎨 现代化UI**：Material-UI设计系统
- **🔄 状态管理**：Redux全局状态管理
- **🚀 快速开发**：Docker容器化部署

---

🎮 **让我们一起重温经典，创造全新的游戏体验！**

> 项目正在积极开发中，欢迎关注和贡献！ 
# 🚀 快速启动指南

这个指南将帮助您在5分钟内启动经典街机游戏平台的开发环境。

## 📋 前置要求

请确保您的系统已安装以下软件：

- **Node.js** 18.0+ ([下载地址](https://nodejs.org/))
- **Docker** 20.10+ ([下载地址](https://www.docker.com/get-started))
- **Docker Compose** 2.0+ (通常随Docker一起安装)
- **Git** ([下载地址](https://git-scm.com/))

检查版本：
```bash
node --version     # 应该显示 v18.x.x 或更高
docker --version   # 应该显示 20.10.x 或更高
git --version      # 应该显示版本信息
```

## 🔧 一键启动

### 1. 克隆项目
```bash
git clone https://github.com/your-username/classic-arcade-platform.git
cd classic-arcade-platform
```

### 2. 安装项目依赖
```bash
# 安装根目录依赖（包含项目管理脚本）
npm install

# 一键安装所有子项目依赖
npm run install:all
```

### 3. 启动开发环境
```bash
# 使用Docker启动数据库服务
npm run docker:dev

# 等待数据库启动完成（约30秒），然后启动前后端服务
npm run dev
```

### 4. 访问应用

开发环境启动后，您可以访问：

- 🎮 **前端应用**: http://localhost:3000
- 🔧 **后端API**: http://localhost:5000
- 📚 **API文档**: http://localhost:5000/api-docs
- 🔍 **数据库**: localhost:3306 (用户名: arcade_user, 密码: arcade_pass)
- 📦 **Redis**: localhost:6379 (密码: redis123456)

## 🎯 测试系统

### 使用默认管理员账户
```
用户名: admin
邮箱: admin@arcade-platform.com
密码: admin123456
```

### 或者注册新用户
1. 访问 http://localhost:3000/register
2. 填写注册信息
3. 开始体验游戏平台！

## 📁 项目结构说明

```
怀旧经典游戏/
├── 📱 frontend/          # React前端应用
│   ├── src/
│   │   ├── components/   # React组件
│   │   ├── pages/        # 页面组件
│   │   ├── store/        # Redux状态管理
│   │   └── services/     # API服务
│   └── package.json
├── 🔧 backend/           # Node.js后端API
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   └── middleware/   # 中间件
│   └── package.json
├── 🗄️ database/          # 数据库脚本
├── 🐳 docker/           # Docker配置
├── 📖 docs/             # 项目文档
└── 🔧 scripts/          # 部署脚本
```

## 🛠️ 开发命令

### 项目管理
```bash
# 启动完整开发环境
npm run dev

# 仅启动后端
npm run backend:dev

# 仅启动前端
npm run frontend:dev

# 构建生产版本
npm run build

# 运行测试
npm run test

# 代码格式化
npm run lint:fix
```

### Docker管理
```bash
# 启动开发环境容器
npm run docker:dev

# 启动生产环境容器
npm run docker:prod

# 停止所有容器
npm run docker:down

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 数据库管理
```bash
# 运行数据库迁移
npm run db:migrate

# 填充示例数据
npm run db:seed

# 重置数据库
npm run db:migrate:undo
npm run db:migrate
npm run db:seed
```

## 🚨 常见问题

### 1. 端口被占用
```bash
# 检查端口占用
lsof -i :3000  # 前端端口
lsof -i :5000  # 后端端口
lsof -i :3306  # MySQL端口

# 杀死占用进程
kill -9 <PID>
```

### 2. Docker容器启动失败
```bash
# 查看详细错误信息
docker-compose logs

# 重新构建容器
docker-compose build --no-cache

# 清理Docker资源
docker system prune -a
```

### 3. 数据库连接失败
```bash
# 检查MySQL容器状态
docker-compose ps mysql

# 手动连接测试
docker-compose exec mysql mysql -u arcade_user -p arcade_platform
```

### 4. 前端编译错误
```bash
# 清理node_modules
cd frontend
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本
node --version  # 应该是18.0+
```

### 5. 后端API无法访问
```bash
# 检查后端容器日志
docker-compose logs backend

# 检查环境变量配置
cat backend/.env
```

## 🎮 开始开发

### 添加新的游戏
1. 在 `database/init.sql` 中添加游戏数据
2. 或者使用管理员账户通过API添加

### 修改前端界面
1. 编辑 `frontend/src/pages/` 中的页面组件
2. 修改 `frontend/src/components/` 中的通用组件
3. 更新 `frontend/src/store/` 中的状态管理

### 添加新的API接口
1. 在 `backend/src/routes/` 中添加新路由
2. 在 `backend/src/controllers/` 中实现业务逻辑
3. 在 `backend/src/models/` 中定义数据模型

## 🔧 开发工具推荐

### VS Code 扩展
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Thunder Client (API测试)

### Chrome 扩展
- React Developer Tools
- Redux DevTools

## 📞 获取帮助

遇到问题？这里有几种获取帮助的方式：

1. 📖 **查看文档**: [docs/](./docs/) 目录包含详细的技术文档
2. 🐛 **提交Issue**: https://github.com/your-username/classic-arcade-platform/issues
3. 💬 **讨论交流**: https://github.com/your-username/classic-arcade-platform/discussions
4. 📧 **发送邮件**: support@arcade-platform.com

## 🎉 下一步

现在您已经成功启动了开发环境，可以开始：

1. 🎮 **体验现有游戏** - 尝试拳皇97、街霸2等经典游戏
2. 👥 **测试社交功能** - 添加好友、创建对战房间
3. 🏆 **查看排行榜** - 看看谁是游戏高手
4. 🔧 **开始开发** - 添加新功能或修改现有功能
5. 📝 **阅读文档** - 深入了解系统架构和API

祝您开发愉快！🚀

---

💡 **提示**: 如果这是您第一次接触这个项目，建议先阅读 [README.md](./README.md) 和 [docs/API.md](./docs/API.md) 来了解项目的整体架构。 
# 🚀 快速参考卡片

## 📋 常用命令

### 一键启动
```bash
npm run dev                    # 启动前后端
npm run docker:dev            # 启动数据库
npm run install:all           # 安装所有依赖
```

### 前端命令
```bash
cd frontend
npm start                     # 启动前端 (http://localhost:3000)
npm run build                 # 构建生产版本
npm test                      # 运行测试
```

### 后端命令
```bash
cd backend
npm run dev                   # 启动后端 (http://localhost:5000)
npm test                      # 运行测试
npm run db:migrate            # 数据库迁移
npm run db:seed               # 填充测试数据
```

### Docker命令
```bash
docker-compose up -d          # 启动所有服务
docker-compose down           # 停止所有服务
docker-compose logs -f        # 查看实时日志
docker-compose ps             # 查看服务状态
```

## 🔌 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 3000 | React开发服务器 |
| 后端 | 5000 | Express API服务器 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |

## 🌐 访问地址

- 🎮 **前端**: http://localhost:3000
- 🔧 **后端API**: http://localhost:5000
- 📚 **API文档**: http://localhost:5000/api-docs
- 🗄️ **数据库**: localhost:3306
- 📦 **Redis**: localhost:6379

## 🔑 测试账户

```
用户名: admin
密码: admin123456
邮箱: admin@arcade-platform.com
```

## 📝 环境变量

### 前端 (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 后端 (.env)
```env
PORT=5000
DB_HOST=localhost
DB_NAME=arcade_platform
JWT_SECRET=your-secret-key
```

## 🧪 测试工具

```bash
node test-room-join.js        # 测试房间加入
node test-ready-status.js     # 测试准备状态
```

## 🔍 故障排除

### 端口被占用
```bash
netstat -ano | findstr :3000  # 检查端口
taskkill /PID <ID> /F         # 杀死进程
```

### 数据库连接失败
```bash
docker-compose logs mysql     # 查看MySQL日志
docker-compose exec mysql mysql -u arcade_user -p arcade_platform
```

### Socket连接失败
```bash
node test-room-join.js        # 测试Socket连接
```

## 📞 紧急联系

- **文档**: `GUIDEBOOK.md`
- **问题**: 查看浏览器控制台 (F12)
- **日志**: `docker-compose logs -f`

---

**记住**: 开发模式下，前端会自动重载，后端需要手动重启！ 
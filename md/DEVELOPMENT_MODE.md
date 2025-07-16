# 开发模式配置说明

## 🛠️ 开发环境免登录功能

为了便于开发和测试，系统在开发环境下支持免登录功能。

### 功能特性

#### 1. 游戏大厅免登录
- **开发环境**: 可以免登录访问游戏大厅
- **生产环境**: 必须登录才能访问
- **检测方式**: `process.env.NODE_ENV !== 'production'`

#### 2. Socket连接免登录
- **开发环境**: 可以免token连接Socket
- **生产环境**: 必须提供有效token
- **测试模式**: 自动创建匿名用户

#### 3. 测试页面支持
- `/test/games` - 游戏测试页面
- `/test/simple` - 简单测试页面
- `/test/tetris` - 俄罗斯方块测试页面

### 环境变量配置

#### 后端环境变量
```bash
# .env 文件
NODE_ENV=development  # 开发环境
# NODE_ENV=production   # 生产环境

JWT_SECRET=your-secret-key
```

#### 前端环境变量
```bash
# .env 文件
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5001
NODE_ENV=development
```

### 开发模式行为

#### 1. 游戏大厅
- 显示20个空房间
- 所有房间状态为 `empty`
- 在线用户数为0
- 活跃房间数为0

#### 2. Socket连接
- 自动创建匿名用户
- 用户ID格式: `test_user_${timestamp}`
- 用户名: "测试用户"
- 等级: 1

#### 3. 房间管理
- 可以进入空房间
- 自动成为房主
- 支持游戏功能测试

### 生产环境行为

#### 1. 强制登录
- 所有API需要有效token
- Socket连接需要认证
- 无token访问会被拒绝

#### 2. 真实数据
- 使用真实用户数据
- 根据在线用户生成房间状态
- 完整的用户权限管理

### 切换环境

#### 开发环境
```bash
# 后端
NODE_ENV=development npm start

# 前端
NODE_ENV=development npm start
```

#### 生产环境
```bash
# 后端
NODE_ENV=production npm start

# 前端
NODE_ENV=production npm run build
```

### 测试建议

#### 1. 开发阶段
- 使用测试页面进行功能验证
- 利用免登录功能快速测试
- 关注控制台日志输出

#### 2. 部署前
- 设置 `NODE_ENV=production`
- 测试登录功能
- 验证权限控制

### 安全注意事项

#### 1. 开发环境
- 仅限本地开发使用
- 不要在生产环境启用
- 注意敏感信息保护

#### 2. 生产环境
- 必须启用完整认证
- 使用强密码和JWT密钥
- 定期更新安全配置

### 故障排除

#### 1. 无法免登录
- 检查 `NODE_ENV` 环境变量
- 确认后端服务重启
- 查看控制台错误信息

#### 2. Socket连接失败
- 检查Socket服务状态
- 确认端口配置
- 查看网络连接

#### 3. 房间无法进入
- 检查Socket认证逻辑
- 确认房间数据生成
- 查看浏览器控制台

### 日志输出

#### 开发模式日志
```
🔧 开发模式：生成测试房间数据
🔧 开发模式：创建匿名Socket用户
✅ Socket连接成功 (测试模式)
```

#### 生产模式日志
```
🚀 生产模式：使用真实用户数据
✅ Socket连接成功
```

---

**注意**: 开发模式仅用于本地开发和测试，请勿在生产环境中使用！ 
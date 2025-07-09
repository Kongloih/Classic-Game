# 经典街机游戏平台部署指南

本指南将帮助您在不同环境中部署经典街机游戏平台。

## 系统要求

### 最低要求
- **CPU**: 2核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **操作系统**: Linux (Ubuntu 20.04+), macOS, Windows 10+

### 推荐配置
- **CPU**: 4核心或更多
- **内存**: 8GB RAM或更多
- **存储**: 100GB SSD
- **网络**: 稳定的互联网连接

### 软件依赖
- **Node.js**: 18.0+
- **MySQL**: 8.0+
- **Redis**: 6.0+
- **Docker**: 20.10+ (可选)
- **Docker Compose**: 2.0+ (可选)

## 部署方式

### 1. Docker 部署 (推荐)

Docker部署是最简单、最一致的部署方式。

#### 快速开始

1. **克隆项目**
```bash
git clone https://github.com/your-username/classic-arcade-platform.git
cd classic-arcade-platform
```

2. **配置环境变量**
```bash
# 复制环境变量模板
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 编辑配置文件
nano backend/.env
```

3. **启动服务**
```bash
# 开发环境
docker-compose up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

4. **初始化数据库**
```bash
# 等待MySQL启动后执行
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

5. **访问应用**
- 前端应用: http://localhost:3000
- 后端API: http://localhost:5000
- API文档: http://localhost:5000/api-docs

#### Docker生产环境配置

创建 `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: arcade_mysql_prod
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: arcade_platform
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_prod_data:/var/lib/mysql
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - arcade_network

  redis:
    image: redis:7-alpine
    container_name: arcade_redis_prod
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod_data:/data
    networks:
      - arcade_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: arcade_backend_prod
    restart: always
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_NAME: arcade_platform
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - backend_uploads:/app/uploads
      - backend_logs:/app/logs
    depends_on:
      - mysql
      - redis
    networks:
      - arcade_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: arcade_frontend_prod
    restart: always
    networks:
      - arcade_network

  nginx:
    image: nginx:alpine
    container_name: arcade_nginx_prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - frontend_build:/usr/share/nginx/html
    depends_on:
      - backend
      - frontend
    networks:
      - arcade_network

volumes:
  mysql_prod_data:
  redis_prod_data:
  backend_uploads:
  backend_logs:
  frontend_build:

networks:
  arcade_network:
    driver: bridge
```

### 2. 手动部署

#### 2.1 准备环境

1. **安装Node.js**
```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node@18

# Windows
# 从官网下载安装包: https://nodejs.org/
```

2. **安装MySQL**
```bash
# Ubuntu
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation

# macOS
brew install mysql
brew services start mysql

# Windows
# 从官网下载安装包: https://dev.mysql.com/downloads/mysql/
```

3. **安装Redis**
```bash
# Ubuntu
sudo apt install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Windows
# 使用WSL或下载Windows版本
```

#### 2.2 部署后端

1. **安装依赖**
```bash
cd backend
npm install --production
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，设置生产环境配置
```

3. **初始化数据库**
```bash
npm run db:migrate
npm run db:seed
```

4. **启动服务**
```bash
# 使用PM2管理进程
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

#### 2.3 部署前端

1. **安装依赖**
```bash
cd frontend
npm install
```

2. **构建生产版本**
```bash
npm run build
```

3. **配置Web服务器**

**使用Nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/frontend/build;
    index index.html;
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Socket.IO支持
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 云平台部署

#### 3.1 阿里云部署

1. **ECS实例配置**
- 选择合适的实例规格
- 安装Docker和Docker Compose
- 配置安全组开放80、443端口

2. **数据库配置**
- 使用RDS MySQL服务
- 配置Redis云服务
- 设置安全组和白名单

3. **域名和SSL**
- 申请域名并备案
- 配置SSL证书
- 设置CDN加速

#### 3.2 AWS部署

1. **使用EC2**
```bash
# 在EC2实例上部署
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **使用RDS和ElastiCache**
- 创建RDS MySQL实例
- 创建ElastiCache Redis集群
- 配置VPC和安全组

#### 3.3 Vercel + Railway部署

1. **前端部署到Vercel**
```bash
npm install -g vercel
cd frontend
vercel
```

2. **后端部署到Railway**
- 连接GitHub仓库
- 设置环境变量
- 配置数据库服务

## 环境配置

### 生产环境变量

**后端环境变量**:
```bash
NODE_ENV=production
PORT=5000
SOCKET_PORT=5001

# 数据库配置
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=arcade_platform
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

# Redis配置
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT配置
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS配置
CORS_ORIGIN=https://your-domain.com

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=no-reply@your-domain.com

# OAuth配置
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 支付配置
WECHAT_PAY_APP_ID=your-wechat-app-id
WECHAT_PAY_MCH_ID=your-wechat-mch-id
WECHAT_PAY_KEY=your-wechat-pay-key

# CDN配置
CDN_BASE_URL=https://cdn.your-domain.com
```

**前端环境变量**:
```bash
REACT_APP_API_BASE_URL=https://api.your-domain.com
REACT_APP_SOCKET_URL=https://api.your-domain.com
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## 监控和维护

### 1. 健康检查

```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs backend
docker-compose logs frontend

# 检查资源使用
docker stats
```

### 2. 备份策略

**数据库备份**:
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec arcade_mysql_prod mysqldump -u root -p$MYSQL_ROOT_PASSWORD arcade_platform > backup_$DATE.sql
```

**文件备份**:
```bash
# 备份上传文件
tar -czf uploads_backup_$DATE.tar.gz uploads/
```

### 3. 性能优化

1. **数据库优化**
- 定期分析慢查询
- 优化索引
- 配置连接池

2. **缓存策略**
- Redis缓存热点数据
- CDN缓存静态资源
- 浏览器缓存配置

3. **负载均衡**
- 使用Nginx负载均衡
- 配置多个后端实例
- 数据库读写分离

## 安全配置

### 1. 防火墙设置

```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. SSL证书

```bash
# 使用Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 安全头部

```nginx
# Nginx安全配置
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 故障排除

### 常见问题

1. **数据库连接失败**
```bash
# 检查MySQL服务
sudo systemctl status mysql
# 检查端口
netstat -tulpn | grep :3306
```

2. **Redis连接失败**
```bash
# 检查Redis服务
sudo systemctl status redis-server
# 测试连接
redis-cli ping
```

3. **前端构建失败**
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

4. **Socket.IO连接问题**
- 检查防火墙设置
- 确认端口开放
- 验证代理配置

## 维护计划

### 日常维护
- 监控系统资源使用
- 检查应用日志
- 备份重要数据

### 定期维护
- 更新安全补丁
- 优化数据库性能
- 清理临时文件

### 应急处理
- 准备回滚方案
- 建立故障响应流程
- 保持监控告警

## 联系支持

如果在部署过程中遇到问题，请：

1. 查看项目Wiki: https://github.com/your-username/classic-arcade-platform/wiki
2. 提交Issue: https://github.com/your-username/classic-arcade-platform/issues
3. 发送邮件: support@arcade-platform.com 
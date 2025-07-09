# 经典街机游戏平台 - 生产环境部署指南

## 概述

本文档详细介绍了如何将经典街机游戏平台部署到生产环境。我们使用Docker容器化技术，确保应用的一致性和可移植性。

## 系统要求

### 服务器要求
- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **CPU**: 至少2核心
- **内存**: 至少4GB RAM
- **存储**: 至少20GB可用空间
- **网络**: 稳定的互联网连接

### 软件要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: 用于代码拉取

## 部署步骤

### 1. 准备服务器环境

#### Ubuntu/Debian系统
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组
sudo usermod -aG docker $USER
```

#### CentOS/RHEL系统
```bash
# 安装Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Windows系统
1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 确保启用WSL2后端
3. 重启系统

### 2. 获取项目代码

```bash
# 克隆项目
git clone <your-repository-url>
cd classic-program

# 或者上传项目文件到服务器
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp env.production.template .env

# 编辑环境变量文件
nano .env
```

**重要**: 请修改以下关键配置：

```bash
# 数据库配置 - 使用强密码
MYSQL_ROOT_PASSWORD=your_very_secure_root_password
MYSQL_PASSWORD=your_very_secure_db_password

# Redis配置 - 使用强密码
REDIS_PASSWORD=your_very_secure_redis_password

# JWT密钥 - 使用随机生成的强密钥
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# 域名配置 - 替换为你的实际域名
CORS_ORIGIN=https://your-domain.com
REACT_APP_API_BASE_URL=https://your-domain.com/api
REACT_APP_SOCKET_URL=https://your-domain.com
```

### 4. 部署应用

#### 使用部署脚本（推荐）

**Linux/macOS**:
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 启动服务
./deploy.sh start

# 查看状态
./deploy.sh status

# 查看日志
./deploy.sh logs
```

**Windows**:
```cmd
# 启动服务
deploy.bat start

# 查看状态
deploy.bat status

# 查看日志
deploy.bat logs
```

#### 手动部署
```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 5. 验证部署

1. **检查服务状态**:
   ```bash
   ./deploy.sh status
   ```

2. **访问应用**:
   - 前端: `http://your-server-ip`
   - API文档: `http://your-server-ip/api/docs`

3. **检查健康状态**:
   ```bash
   curl http://your-server-ip/health
   curl http://your-server-ip:5000/health
   ```

## 服务管理

### 常用命令

```bash
# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看日志
./deploy.sh logs

# 查看状态
./deploy.sh status

# 清理资源
./deploy.sh cleanup

# 备份数据库
./deploy.sh backup
```

### 手动管理

```bash
# 查看所有容器
docker ps -a

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs backend

# 进入容器
docker exec -it arcade-platform_backend_prod sh

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart backend
```

## 监控和维护

### 日志管理

```bash
# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定时间段的日志
docker-compose -f docker-compose.prod.yml logs --since="2024-01-01T00:00:00" backend

# 导出日志
docker-compose -f docker-compose.prod.yml logs > app.log
```

### 数据库备份

```bash
# 自动备份
./deploy.sh backup

# 手动备份
docker exec arcade-platform_mysql_prod mysqldump -u root -p[password] arcade_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复备份
docker exec -i arcade-platform_mysql_prod mysql -u root -p[password] arcade_platform < backup_file.sql
```

### 性能监控

```bash
# 查看资源使用情况
docker stats

# 查看磁盘使用情况
docker system df

# 清理未使用的资源
docker system prune -a
```

## 安全配置

### 防火墙设置

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

### SSL证书配置

1. 获取SSL证书（Let's Encrypt推荐）
2. 配置nginx支持HTTPS
3. 更新环境变量中的URL为HTTPS

### 安全最佳实践

1. **定期更新密码**
2. **启用防火墙**
3. **配置SSL证书**
4. **定期备份数据**
5. **监控系统日志**
6. **限制数据库访问**

## 故障排除

### 常见问题

1. **服务启动失败**
   ```bash
   # 查看详细错误信息
   docker-compose -f docker-compose.prod.yml logs
   
   # 检查端口占用
   netstat -tulpn | grep :80
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL容器状态
   docker ps | grep mysql
   
   # 查看MySQL日志
   docker logs arcade-platform_mysql_prod
   ```

3. **前端无法访问后端API**
   ```bash
   # 检查网络连接
   docker network ls
   docker network inspect classic-program_arcade_network
   ```

4. **内存不足**
   ```bash
   # 查看内存使用
   free -h
   
   # 清理Docker资源
   docker system prune -a
   ```

### 性能优化

1. **增加系统资源**
2. **优化数据库查询**
3. **启用Redis缓存**
4. **配置CDN**
5. **启用Gzip压缩**

## 更新部署

### 代码更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
./deploy.sh restart
```

### 配置更新

```bash
# 修改环境变量
nano .env

# 重启服务
./deploy.sh restart
```

## 联系支持

如果在部署过程中遇到问题，请：

1. 查看日志文件
2. 检查系统资源
3. 验证网络连接
4. 联系技术支持团队

---

**注意**: 生产环境部署前请确保：
- 所有密码都已更改为强密码
- 防火墙已正确配置
- SSL证书已安装（如需要）
- 备份策略已制定
- 监控系统已配置 
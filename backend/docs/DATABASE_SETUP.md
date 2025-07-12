# 数据库设置指南

## 概述

本文档描述了如何设置和初始化经典街机游戏平台的数据库，包括所有必要的表结构和初始数据。

## 数据库结构

### 核心表

1. **users** - 用户表
2. **games** - 游戏表
3. **battle_rooms** - 战斗房间表
4. **battle_tables** - 战斗桌子表
5. **user_status** - 用户状态表

### 关联表

6. **friendships** - 好友关系表
7. **game_records** - 游戏记录表
8. **user_favorites** - 用户收藏表
9. **game_ratings** - 游戏评分表

## 快速开始

### 1. 环境配置

确保你的环境变量配置正确：

```bash
# .env 文件
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=arcade_platform
```

### 2. 初始化数据库

运行以下命令来创建所有表和初始数据：

```bash
cd backend
npm run db:init
```

这个命令会：
- 创建数据库（如果不存在）
- 创建所有必要的表
- 插入示例游戏数据
- 创建管理员和测试用户

### 3. 初始化战斗系统

运行以下命令来初始化战斗系统的房间和桌子：

```bash
npm run battle:init
```

这个命令会：
- 为每个游戏创建3个房间（room_1, room_2, room_3）
- 为每个房间创建50张桌子（table_1 到 table_50）
- 设置正确的房间和桌子状态

## 表结构详情

### battle_rooms 表

```sql
CREATE TABLE `battle_rooms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `room_id` VARCHAR(20) NOT NULL COMMENT '房间ID: room_1, room_2, room_3',
  `game_id` INT(11) NOT NULL COMMENT '游戏ID',
  `name` VARCHAR(100) NOT NULL COMMENT '房间名称',
  `status` ENUM('未满员', '满员') DEFAULT '未满员' COMMENT '房间状态',
  `online_users` INT(11) DEFAULT 0 COMMENT '当前在线用户数量',
  `max_user` INT(11) DEFAULT 500 COMMENT '房间最大容纳用户数量',
  `max_tables` INT(11) DEFAULT 50 COMMENT '最大桌子数量',
  `current_tables` INT(11) DEFAULT 0 COMMENT '当前桌子数量',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_game` (`room_id`, `game_id`)
);
```

### battle_tables 表

```sql
CREATE TABLE `battle_tables` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `table_id` VARCHAR(20) NOT NULL COMMENT '桌子ID: table_1, table_2, ..., table_50',
  `room_id` INT(11) NOT NULL COMMENT '房间ID',
  `seat_1_user_id` INT(11) DEFAULT NULL COMMENT '座位1用户ID',
  `seat_2_user_id` INT(11) DEFAULT NULL COMMENT '座位2用户ID',
  `seat_3_user_id` INT(11) DEFAULT NULL COMMENT '座位3用户ID',
  `seat_4_user_id` INT(11) DEFAULT NULL COMMENT '座位4用户ID',
  `status` ENUM('empty', 'waiting', 'playing', 'finished') DEFAULT 'empty',
  `current_players` INT(11) DEFAULT 0 COMMENT '当前玩家数量',
  `max_players` INT(11) DEFAULT 4 COMMENT '最大玩家数量',
  `game_start_time` DATETIME DEFAULT NULL,
  `game_end_time` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_table_room` (`table_id`, `room_id`)
);
```

### user_status 表

```sql
CREATE TABLE `user_status` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL COMMENT '用户ID',
  `room_id` INT(11) DEFAULT NULL COMMENT '房间ID',
  `table_id` INT(11) DEFAULT NULL COMMENT '桌子ID',
  `seat_number` INT(11) DEFAULT NULL COMMENT '座位号: 1, 2, 3, 4',
  `status` ENUM('idle', 'waiting', 'playing', 'spectating') DEFAULT 'idle',
  `last_activity` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
);
```

## 初始数据

### 游戏数据

系统会自动创建以下游戏：

1. **俄罗斯方块** (Tetris) - 益智游戏
2. **贪吃蛇** (Snake) - 街机游戏
3. **打砖块** (Breakout) - 街机游戏
4. **拳皇97** (The King of Fighters 97) - 格斗游戏
5. **街头霸王2** (Street Fighter II) - 格斗游戏

### 用户数据

- **管理员用户**: admin / admin@arcade-platform.com
- **测试用户**: demo / demo@example.com (密码: demo123)

## 验证安装

### 1. 检查表结构

```bash
# 连接到MySQL
mysql -u root -p arcade_platform

# 查看所有表
SHOW TABLES;

# 检查表结构
DESCRIBE battle_rooms;
DESCRIBE battle_tables;
DESCRIBE user_status;
```

### 2. 检查数据

```sql
-- 检查游戏数据
SELECT * FROM games;

-- 检查房间数据
SELECT * FROM battle_rooms;

-- 检查桌子数据
SELECT COUNT(*) as table_count FROM battle_tables;

-- 检查用户数据
SELECT username, email, level FROM users;
```

### 3. 使用脚本验证

```bash
# 运行验证脚本
node scripts/init-database.js
```

## 故障排除

### 常见问题

1. **连接错误**
   - 检查MySQL服务是否运行
   - 验证数据库连接配置
   - 确保用户有足够权限

2. **表创建失败**
   - 检查SQL语法
   - 确保数据库存在
   - 验证字符集设置

3. **外键约束错误**
   - 确保相关表已创建
   - 检查外键引用是否正确

### 重置数据库

如果需要完全重置数据库：

```bash
# 删除并重新创建数据库
mysql -u root -p -e "DROP DATABASE IF EXISTS arcade_platform; CREATE DATABASE arcade_platform;"

# 重新初始化
npm run db:init
npm run battle:init
```

## 生产环境部署

### 1. 数据库备份

```bash
# 备份数据库
mysqldump -u root -p arcade_platform > backup.sql

# 恢复数据库
mysql -u root -p arcade_platform < backup.sql
```

### 2. 性能优化

```sql
-- 添加索引优化查询性能
CREATE INDEX idx_battle_rooms_game_status ON battle_rooms(game_id, status);
CREATE INDEX idx_battle_tables_room_status ON battle_tables(room_id, status);
CREATE INDEX idx_user_status_activity ON user_status(last_activity);
```

### 3. 监控

```sql
-- 查看表大小
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'arcade_platform';

-- 查看活跃用户
SELECT COUNT(*) as active_users 
FROM user_status 
WHERE last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE);
```

## 维护脚本

### 清理过期数据

```bash
# 清理超时用户状态
node scripts/cleanup-timeout-users.js

# 清理过期游戏记录
node scripts/cleanup-old-records.js
```

### 数据统计

```bash
# 生成数据统计报告
node scripts/generate-stats.js
```

## 联系支持

如果在设置过程中遇到问题，请：

1. 检查错误日志
2. 验证环境配置
3. 确认MySQL版本兼容性
4. 联系技术支持团队 
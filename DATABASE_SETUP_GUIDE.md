# 数据库设置指南

## 问题描述

您遇到的问题是"所有新建的table和field没有建和初始化"。这意味着数据库中的新表结构（battle_rooms、battle_tables、user_status）还没有被创建。

## 解决方案

### 方法1: 手动执行SQL文件（推荐）

1. **打开MySQL客户端**
   ```bash
   mysql -u root -p
   ```

2. **执行SQL文件**
   ```bash
   source database/create-tables.sql
   ```

### 方法2: 复制SQL内容手动执行

1. **打开MySQL客户端**
   ```bash
   mysql -u root -p
   ```

2. **创建数据库**
   ```sql
   CREATE DATABASE IF NOT EXISTS arcade_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE arcade_platform;
   ```

3. **执行以下SQL语句创建表**

#### 战斗房间表 (battle_rooms)
```sql
CREATE TABLE IF NOT EXISTS `battle_rooms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `room_id` VARCHAR(20) NOT NULL COMMENT '房间ID: room_1, room_2, room_3',
  `game_id` INT(11) NOT NULL COMMENT '游戏ID',
  `name` VARCHAR(100) NOT NULL COMMENT '房间名称',
  `status` ENUM('未满员', '满员') DEFAULT '未满员' COMMENT '房间状态',
  `online_users` INT(11) DEFAULT 0 COMMENT '当前在线用户数量',
  `max_user` INT(11) DEFAULT 500 COMMENT '房间最大容纳用户数量',
  `max_tables` INT(11) DEFAULT 50 COMMENT '最大桌子数量',
  `current_tables` INT(11) DEFAULT 0 COMMENT '当前桌子数量',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_game` (`room_id`, `game_id`),
  INDEX `idx_game_id` (`game_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_online_users` (`online_users`),
  FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='战斗房间表';
```

#### 战斗桌子表 (battle_tables)
```sql
CREATE TABLE IF NOT EXISTS `battle_tables` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `table_id` VARCHAR(20) NOT NULL COMMENT '桌子ID: table_1, table_2, ..., table_50',
  `room_id` INT(11) NOT NULL COMMENT '房间ID',
  `seat_1_user_id` INT(11) DEFAULT NULL COMMENT '座位1用户ID',
  `seat_2_user_id` INT(11) DEFAULT NULL COMMENT '座位2用户ID',
  `seat_3_user_id` INT(11) DEFAULT NULL COMMENT '座位3用户ID',
  `seat_4_user_id` INT(11) DEFAULT NULL COMMENT '座位4用户ID',
  `status` ENUM('empty', 'waiting', 'playing', 'finished') DEFAULT 'empty' COMMENT '桌子状态',
  `current_players` INT(11) DEFAULT 0 COMMENT '当前玩家数量',
  `max_players` INT(11) DEFAULT 4 COMMENT '最大玩家数量',
  `game_start_time` DATETIME DEFAULT NULL COMMENT '游戏开始时间',
  `game_end_time` DATETIME DEFAULT NULL COMMENT '游戏结束时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_table_room` (`table_id`, `room_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_current_players` (`current_players`),
  INDEX `idx_seat_1` (`seat_1_user_id`),
  INDEX `idx_seat_2` (`seat_2_user_id`),
  INDEX `idx_seat_3` (`seat_3_user_id`),
  INDEX `idx_seat_4` (`seat_4_user_id`),
  FOREIGN KEY (`room_id`) REFERENCES `battle_rooms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seat_1_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`seat_2_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`seat_3_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`seat_4_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='战斗桌子表';
```

#### 用户状态表 (user_status)
```sql
CREATE TABLE IF NOT EXISTS `user_status` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL COMMENT '用户ID',
  `room_id` INT(11) DEFAULT NULL COMMENT '房间ID',
  `table_id` INT(11) DEFAULT NULL COMMENT '桌子ID',
  `seat_number` INT(11) DEFAULT NULL COMMENT '座位号: 1, 2, 3, 4',
  `status` ENUM('idle', 'waiting', 'playing', 'spectating') DEFAULT 'idle' COMMENT '用户状态',
  `last_activity` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后活动时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  INDEX `idx_room_id` (`room_id`),
  INDEX `idx_table_id` (`table_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_last_activity` (`last_activity`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `battle_rooms` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`table_id`) REFERENCES `battle_tables` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户状态表';
```

### 方法3: 使用Sequelize同步（如果环境配置正确）

1. **确保.env文件配置正确**
   ```bash
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=arcade_platform
   DB_USER=root
   DB_PASSWORD=your_password
   ```

2. **运行Sequelize同步**
   ```bash
   cd backend
   node -e "const { sequelize } = require('./src/config/database'); sequelize.sync({force: false}).then(() => { console.log('数据库同步完成'); process.exit(0); });"
   ```

## 验证表是否创建成功

执行以下SQL查询验证表是否创建成功：

```sql
-- 查看所有表
SHOW TABLES;

-- 检查新表是否存在
SHOW TABLES LIKE 'battle_%';
SHOW TABLES LIKE 'user_status';

-- 查看表结构
DESCRIBE battle_rooms;
DESCRIBE battle_tables;
DESCRIBE user_status;
```

## 初始化战斗系统

表创建完成后，运行以下命令初始化战斗系统：

```bash
cd backend
npm run battle:init
```

这个命令会：
- 为每个游戏创建3个房间（room_1, room_2, room_3）
- 为每个房间创建50张桌子（table_1 到 table_50）
- 设置正确的房间和桌子状态

## 常见问题

### 1. 权限错误
```
Access denied for user 'root'@'localhost'
```
**解决方案**: 检查MySQL用户名和密码是否正确

### 2. 外键约束错误
```
Cannot add foreign key constraint
```
**解决方案**: 确保先创建被引用的表（users, games）

### 3. 表已存在错误
```
Table 'battle_rooms' already exists
```
**解决方案**: 使用 `CREATE TABLE IF NOT EXISTS` 语句

## 完成后的验证

执行以下查询确认所有表和数据都已正确创建：

```sql
-- 检查表数量
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'arcade_platform';

-- 检查游戏数据
SELECT * FROM games;

-- 检查房间数据
SELECT * FROM battle_rooms;

-- 检查桌子数据
SELECT COUNT(*) as table_count FROM battle_tables;
```

## 下一步

表创建完成后，您可以：

1. 启动后端服务器：`npm run dev`
2. 启动前端服务器：`cd ../frontend && npm start`
3. 测试战斗系统功能

如果还有问题，请检查：
- MySQL服务是否正在运行
- 数据库连接配置是否正确
- 用户权限是否足够 
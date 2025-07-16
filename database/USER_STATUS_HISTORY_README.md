# User Status History 表使用说明

## 概述

`user_status_history` 表用于记录用户状态变化的历史记录，包括进入房间、离开房间、加入桌子、离开桌子等操作。

## 表结构

### 主要字段

- `id`: 主键ID，自增
- `user_id`: 用户ID（必填）
- `room_id`: 房间ID（可为空）
- `table_id`: 桌子ID（可为空）
- `seat_number`: 座位号（可为空）
- `status`: 用户状态（idle/waiting/playing/spectating）
- `action`: 操作类型（enter_room/leave_room/join_table/leave_table/start_game/end_game/status_change）
- `previous_status`: 之前的状态
- `previous_room_id`: 之前的房间ID
- `previous_table_id`: 之前的桌子ID
- `previous_seat_number`: 之前的座位号
- `duration_seconds`: 在之前状态停留的秒数
- `metadata`: 额外信息（JSON格式）
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 安装步骤

### 方法1: 直接执行SQL文件

1. 进入数据库目录：
   ```bash
   cd database
   ```

2. 执行SQL文件：
   ```sql
   source create_user_status_history.sql;
   ```

### 方法2: 使用Node.js脚本

1. 进入数据库目录：
   ```bash
   cd database
   ```

2. 运行初始化脚本：
   ```bash
   node init-user-status-history.js
   ```

## 触发器

表创建了两个触发器：

1. `tr_user_status_history_insert`: 在 `user_status` 表插入记录时自动创建历史记录
2. `tr_user_status_history_update`: 在 `user_status` 表更新记录时自动创建历史记录

## 使用示例

### 手动插入历史记录

```sql
INSERT INTO user_status_history (
    user_id, 
    room_id, 
    table_id, 
    seat_number, 
    status, 
    action, 
    metadata
) VALUES (
    1, 
    1, 
    1, 
    1, 
    'waiting', 
    'enter_room', 
    '{"game_id": 1, "note": "用户手动进入房间"}'
);
```

### 查询用户状态历史

```sql
-- 查询用户最近的状态变化
SELECT * FROM user_status_history 
WHERE user_id = 1 
ORDER BY created_at DESC 
LIMIT 10;

-- 查询用户在特定房间的状态历史
SELECT * FROM user_status_history 
WHERE user_id = 1 AND room_id = 1 
ORDER BY created_at DESC;

-- 查询特定操作类型的历史记录
SELECT * FROM user_status_history 
WHERE action = 'enter_room' 
ORDER BY created_at DESC;
```

### 在代码中使用

```javascript
const UserStatusHistory = require('../models/UserStatusHistory');

// 创建历史记录
await UserStatusHistory.create({
  user_id: userId,
  room_id: roomId,
  table_id: tableId,
  seat_number: seatNumber,
  status: 'waiting',
  action: 'join_table',
  metadata: JSON.stringify({
    game_id: gameId,
    reason: 'user_clicked_seat'
  })
});

// 查询历史记录
const history = await UserStatusHistory.findAll({
  where: { user_id: userId },
  order: [['created_at', 'DESC']],
  limit: 10
});
```

## 索引说明

表创建了以下索引以提高查询性能：

- `idx_user_id`: 用户ID索引
- `idx_room_id`: 房间ID索引
- `idx_table_id`: 桌子ID索引
- `idx_status`: 状态索引
- `idx_action`: 操作类型索引
- `idx_created_at`: 创建时间索引
- `idx_user_created`: 用户ID+创建时间复合索引
- `idx_room_created`: 房间ID+创建时间复合索引
- `idx_table_created`: 桌子ID+创建时间复合索引

## 注意事项

1. 触发器会自动记录 `user_status` 表的变化，无需手动维护
2. `metadata` 字段使用JSON格式存储额外信息
3. `duration_seconds` 字段在触发器更新时自动计算
4. 外键约束已注释，可根据需要启用

## 清理策略

建议定期清理旧的历史记录以节省存储空间：

```sql
-- 删除30天前的历史记录
DELETE FROM user_status_history 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 或者保留每个用户最近1000条记录
DELETE FROM user_status_history 
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id FROM user_status_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1000
  ) AS recent_records
);
``` 
# API 文档

经典街机游戏平台后端API文档

## 📋 概述

- **基础URL**: `http://localhost:5000/api`
- **认证方式**: JWT Token (Bearer Token)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 🔐 认证相关

### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "avatar": "string|null",
      "level": 1,
      "experience": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_string"
  }
}
```

### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "avatar": "string|null",
      "level": 1,
      "experience": 0
    },
    "token": "jwt_token_string"
  }
}
```

### 检查认证状态
```http
GET /api/auth/status
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "isAuthenticated": true,
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "avatar": "string|null",
      "level": 1,
      "experience": 0
    }
  }
}
```

### 用户登出
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "登出成功"
}
```

## 🎮 游戏相关

### 获取游戏列表
```http
GET /api/games
```

**响应**:
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": 1,
        "name": "俄罗斯方块",
        "description": "经典的俄罗斯方块游戏",
        "image": "/images/tetris.jpg",
        "category": "益智",
        "difficulty": "中等",
        "maxPlayers": 2,
        "rating": 4.8,
        "playCount": 15420,
        "onlinePlayers": 234,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 6
  }
}
```

### 获取游戏详情
```http
GET /api/games/:id
```

**响应**:
```json
{
  "success": true,
  "data": {
    "game": {
      "id": 1,
      "name": "俄罗斯方块",
      "description": "经典的俄罗斯方块游戏",
      "image": "/images/tetris.jpg",
      "category": "益智",
      "difficulty": "中等",
      "maxPlayers": 2,
      "rating": 4.8,
      "playCount": 15420,
      "onlinePlayers": 234,
      "instructions": "使用方向键控制方块移动和旋转",
      "controls": {
        "arrowKeys": "移动方块",
        "space": "快速下落",
        "rotate": "旋转方块"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 获取游戏大厅信息
```http
GET /api/games/:id/hall
```

**响应**:
```json
{
  "success": true,
  "data": {
    "game": {
      "id": 1,
      "name": "俄罗斯方块",
      "maxPlayers": 2
    },
    "statistics": {
      "onlinePlayers": 234,
      "activeRooms": 45,
      "totalGames": 15420,
      "highestScore": 50000
    },
    "tables": [
      {
        "id": 1,
        "status": "waiting", // empty, waiting, full
        "players": [
          {
            "id": 1,
            "username": "player1",
            "avatar": "string|null",
            "score": 1000,
            "isReady": true
          }
        ],
        "maxPlayers": 2,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50
  }
}
```

## ⚔️ 对战系统

### 获取对战房间列表
```http
GET /api/battle/rooms
Query Parameters:
- gameId: number (可选)
- status: string (可选) - empty, waiting, full, playing
- page: number (默认: 1)
- limit: number (默认: 20)
```

**响应**:
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": 1,
        "gameId": 1,
        "gameName": "俄罗斯方块",
        "status": "waiting",
        "players": [
          {
            "id": 1,
            "username": "player1",
            "avatar": "string|null",
            "score": 1000,
            "isReady": true,
            "isHost": true
          }
        ],
        "maxPlayers": 2,
        "settings": {
          "difficulty": "normal",
          "timeLimit": 300,
          "rounds": 3
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### 创建对战房间
```http
POST /api/battle/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": 1,
  "settings": {
    "difficulty": "normal",
    "timeLimit": 300,
    "rounds": 3
  }
}
```

**响应**:
```json
{
  "success": true,
  "message": "房间创建成功",
  "data": {
    "room": {
      "id": 1,
      "gameId": 1,
      "gameName": "俄罗斯方块",
      "status": "waiting",
      "players": [
        {
          "id": 1,
          "username": "player1",
          "avatar": "string|null",
          "score": 0,
          "isReady": false,
          "isHost": true
        }
      ],
      "maxPlayers": 2,
      "settings": {
        "difficulty": "normal",
        "timeLimit": 300,
        "rounds": 3
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 加入对战房间
```http
POST /api/battle/rooms/:roomId/join
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "成功加入房间",
  "data": {
    "room": {
      "id": 1,
      "gameId": 1,
      "gameName": "俄罗斯方块",
      "status": "waiting",
      "players": [
        {
          "id": 1,
          "username": "player1",
          "avatar": "string|null",
          "score": 0,
          "isReady": false,
          "isHost": true
        },
        {
          "id": 2,
          "username": "player2",
          "avatar": "string|null",
          "score": 0,
          "isReady": false,
          "isHost": false
        }
      ],
      "maxPlayers": 2,
      "settings": {
        "difficulty": "normal",
        "timeLimit": 300,
        "rounds": 3
      }
    }
  }
}
```

### 离开对战房间
```http
POST /api/battle/rooms/:roomId/leave
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "成功离开房间"
}
```

### 准备/取消准备
```http
POST /api/battle/rooms/:roomId/ready
Authorization: Bearer <token>
Content-Type: application/json

{
  "ready": true
}
```

**响应**:
```json
{
  "success": true,
  "message": "准备状态已更新",
  "data": {
    "player": {
      "id": 1,
      "username": "player1",
      "isReady": true
    }
  }
}
```

### 开始游戏
```http
POST /api/battle/rooms/:roomId/start
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "message": "游戏开始",
  "data": {
    "gameSession": {
      "id": "session_123",
      "roomId": 1,
      "status": "playing",
      "startTime": "2024-01-01T00:00:00.000Z",
      "players": [
        {
          "id": 1,
          "username": "player1",
          "score": 0
        }
      ]
    }
  }
}
```

## 👥 用户相关

### 获取用户信息
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "avatar": "string|null",
      "level": 1,
      "experience": 0,
      "totalGames": 100,
      "winRate": 0.65,
      "highestScore": 50000,
      "achievements": [
        {
          "id": 1,
          "name": "初出茅庐",
          "description": "完成第一局游戏",
          "icon": "/images/achievements/first_game.png",
          "unlockedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 更新用户信息
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "string",
  "avatar": "string"
}
```

**响应**:
```json
{
  "success": true,
  "message": "用户信息更新成功",
  "data": {
    "user": {
      "id": 1,
      "username": "string",
      "email": "string",
      "avatar": "string",
      "level": 1,
      "experience": 0
    }
  }
}
```

### 获取用户游戏记录
```http
GET /api/users/games
Authorization: Bearer <token>
Query Parameters:
- page: number (默认: 1)
- limit: number (默认: 20)
- gameId: number (可选)
```

**响应**:
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": 1,
        "gameId": 1,
        "gameName": "俄罗斯方块",
        "score": 5000,
        "result": "win", // win, lose, draw
        "duration": 300,
        "playedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## 🏆 排行榜

### 获取游戏排行榜
```http
GET /api/leaderboard/:gameId
Query Parameters:
- type: string (global, weekly, monthly)
- page: number (默认: 1)
- limit: number (默认: 20)
```

**响应**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": 1,
        "username": "player1",
        "avatar": "string|null",
        "score": 50000,
        "level": 10,
        "gamesPlayed": 100
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "pages": 50
    }
  }
}
```

### 获取用户排名
```http
GET /api/leaderboard/:gameId/user/:userId
```

**响应**:
```json
{
  "success": true,
  "data": {
    "rank": 15,
    "user": {
      "id": 1,
      "username": "player1",
      "avatar": "string|null",
      "score": 50000,
      "level": 10,
      "gamesPlayed": 100
    }
  }
}
```

## 🔧 错误处理

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "输入参数验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  }
}
```

### 常见错误代码
- `VALIDATION_ERROR`: 输入参数验证失败
- `AUTHENTICATION_ERROR`: 认证失败
- `AUTHORIZATION_ERROR`: 权限不足
- `NOT_FOUND`: 资源不存在
- `CONFLICT`: 资源冲突
- `INTERNAL_ERROR`: 服务器内部错误

### HTTP状态码
- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源不存在
- `409`: 资源冲突
- `500`: 服务器内部错误

## 📡 WebSocket 事件

### 连接认证
```javascript
// 客户端连接时发送认证信息
socket.emit('authenticate', { token: 'jwt_token' });
```

### 房间事件
```javascript
// 加入房间
socket.emit('join_room', { roomId: 1 });

// 离开房间
socket.emit('leave_room', { roomId: 1 });

// 准备状态更新
socket.emit('player_ready', { roomId: 1, ready: true });

// 聊天消息
socket.emit('chat_message', { 
  roomId: 1, 
  message: 'Hello everyone!' 
});
```

### 服务器事件
```javascript
// 监听玩家加入
socket.on('player_joined', (data) => {
  console.log('玩家加入:', data.player);
});

// 监听玩家离开
socket.on('player_left', (data) => {
  console.log('玩家离开:', data.player);
});

// 监听准备状态更新
socket.on('player_ready_updated', (data) => {
  console.log('准备状态更新:', data.player);
});

// 监听游戏开始
socket.on('game_started', (data) => {
  console.log('游戏开始:', data.gameSession);
});

// 监听聊天消息
socket.on('chat_message', (data) => {
  console.log('聊天消息:', data.message);
});
```

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 基础用户认证系统
- 游戏大厅系统
- 对战房间功能
- WebSocket实时通信

---

> 更多详细信息和示例代码请参考项目源码。 
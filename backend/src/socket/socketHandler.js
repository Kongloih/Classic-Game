const jwt = require('jsonwebtoken');

// 游戏房间状态管理
const gameRooms = new Map();

const socketHandler = (io) => {
  // 身份验证中间件
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.username = decoded.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`用户 ${socket.username} 已连接`);

    // 加入用户房间
    socket.join(`user_${socket.userId}`);

    // 广播用户上线
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.username
    });

    // 处理加入游戏房间
    socket.on('join_game_room', (data) => {
      const { roomId, gameType } = data;
      
      // 离开之前的房间
      socket.rooms.forEach(room => {
        if (room.startsWith('game_')) {
          socket.leave(room);
        }
      });
      
      socket.join(`game_${roomId}`);
      
      // 初始化游戏房间状态
      if (!gameRooms.has(roomId)) {
        gameRooms.set(roomId, {
          gameType,
          players: new Map(),
          gameState: 'waiting',
          startTime: null
        });
      }
      
      const room = gameRooms.get(roomId);
      room.players.set(socket.userId, {
        id: socket.userId,
        username: socket.username,
        ready: false,
        score: 0,
        lines: 0,
        level: 1
      });
      
      // 通知房间内其他玩家
      socket.to(`game_${roomId}`).emit('player_joined_game', {
        playerId: socket.userId,
        playerName: socket.username
      });
      
      console.log(`用户 ${socket.username} 加入游戏房间 ${roomId}`);
    });

    // 处理玩家准备状态
    socket.on('player_ready', (data) => {
      const { roomId, gameType, isReady } = data;
      const room = gameRooms.get(roomId);
      
      if (room && room.players.has(socket.userId)) {
        room.players.get(socket.userId).ready = isReady;
        
        // 通知房间内其他玩家
        socket.to(`game_${roomId}`).emit('player_ready_status', {
          playerId: socket.userId,
          playerName: socket.username,
          isReady
        });
        
        console.log(`用户 ${socket.username} ${isReady ? '准备' : '取消准备'}`);
      }
    });

    // 处理游戏开始请求
    socket.on('request_game_start', (data) => {
      const { roomId, gameType } = data;
      const room = gameRooms.get(roomId);
      
      if (room) {
        const allReady = Array.from(room.players.values()).every(player => player.ready);
        
        if (allReady && room.players.size >= 2) {
          room.gameState = 'playing';
          room.startTime = Date.now();
          
          // 通知所有玩家游戏开始
          io.to(`game_${roomId}`).emit('game_started', {
            roomId,
            gameType,
            startTime: room.startTime
          });
          
          console.log(`游戏房间 ${roomId} 开始游戏`);
        }
      }
    });

    // 处理游戏状态更新
    socket.on('game_state_update', (data) => {
      const { roomId, gameType, gameState } = data;
      const room = gameRooms.get(roomId);
      
      if (room && room.players.has(socket.userId)) {
        const player = room.players.get(socket.userId);
        player.score = gameState.score || player.score;
        player.lines = gameState.lines || player.lines;
        player.level = gameState.level || player.level;
        
        // 发送给对手
        socket.to(`game_${roomId}`).emit('opponent_state_update', {
          board: gameState.board,
          score: gameState.score,
          lines: gameState.lines,
          level: gameState.level
        });
      }
    });

    // 处理游戏结束
    socket.on('game_over', (data) => {
      const { roomId, gameType, finalScore } = data;
      const room = gameRooms.get(roomId);
      
      if (room && room.players.has(socket.userId)) {
        const player = room.players.get(socket.userId);
        player.score = finalScore;
        
        // 通知对手游戏结束
        socket.to(`game_${roomId}`).emit('game_over', {
          winnerId: socket.userId,
          winnerName: socket.username,
          finalScore
        });
        
        console.log(`用户 ${socket.username} 游戏结束，最终分数: ${finalScore}`);
      }
    });

    // 处理离开游戏房间
    socket.on('leave_game_room', (data) => {
      const { roomId, gameType } = data;
      
      socket.leave(`game_${roomId}`);
      
      const room = gameRooms.get(roomId);
      if (room && room.players.has(socket.userId)) {
        room.players.delete(socket.userId);
        
        // 通知其他玩家
        socket.to(`game_${roomId}`).emit('player_left_game', {
          playerId: socket.userId,
          playerName: socket.username
        });
        
        // 如果房间空了，删除房间
        if (room.players.size === 0) {
          gameRooms.delete(roomId);
        }
        
        console.log(`用户 ${socket.username} 离开游戏房间 ${roomId}`);
      }
    });

    // 处理游戏动作（通用）
    socket.on('game_action', (data) => {
      const { roomId, action, gameData } = data;
      socket.to(`game_${roomId}`).emit('game_update', {
        userId: socket.userId,
        username: socket.username,
        action,
        gameData
      });
    });

    // 处理聊天消息
    socket.on('chat_message', (data) => {
      const { roomId, message } = data;
      io.to(`chat_${roomId}`).emit('new_message', {
        userId: socket.userId,
        username: socket.username,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // 处理好友请求
    socket.on('friend_request', (data) => {
      const { targetUserId } = data;
      io.to(`user_${targetUserId}`).emit('friend_request_received', {
        fromUserId: socket.userId,
        fromUsername: socket.username
      });
    });

    // 处理断开连接
    socket.on('disconnect', () => {
      console.log(`用户 ${socket.username} 已断开连接`);
      
      // 从所有游戏房间中移除用户
      gameRooms.forEach((room, roomId) => {
        if (room.players.has(socket.userId)) {
          room.players.delete(socket.userId);
          
          // 通知其他玩家
          socket.to(`game_${roomId}`).emit('player_left_game', {
            playerId: socket.userId,
            playerName: socket.username
          });
          
          // 如果房间空了，删除房间
          if (room.players.size === 0) {
            gameRooms.delete(roomId);
          }
        }
      });
      
      // 广播用户下线
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        username: socket.username
      });
    });
  });
};

module.exports = socketHandler; 
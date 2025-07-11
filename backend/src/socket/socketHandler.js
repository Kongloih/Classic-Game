const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 在线用户管理
const onlineUsers = new Map(); // userId -> socket
const gameRooms = new Map(); // roomId -> roomData

const socketHandler = (io) => {
  // 身份验证中间件
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // 获取用户信息
      const user = await User.findByPk(decoded.userId);
      if (!user || user.status !== 'active') {
        return next(new Error('User not found or inactive'));
      }
      
      socket.userId = user.id;
      socket.username = user.username;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`用户 ${socket.username} (ID: ${socket.userId}) 已连接`);

    // 添加用户到在线列表
    onlineUsers.set(socket.userId, socket);

    // 加入用户房间
    socket.join(`user_${socket.userId}`);

    // 更新用户最后登录时间
    User.update(
      { last_login_at: new Date() },
      { where: { id: socket.userId } }
    );

    // 广播用户上线
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      username: socket.username,
      avatar: socket.user.avatar,
      level: socket.user.level
    });

    // 发送在线用户列表给新连接的用户
    const onlineUsersList = Array.from(onlineUsers.values()).map(s => ({
      userId: s.userId,
      username: s.username,
      avatar: s.user.avatar,
      level: s.user.level
    }));
    socket.emit('online_users_list', onlineUsersList);

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
          startTime: null,
          createdAt: new Date()
        });
      }
      
      const room = gameRooms.get(roomId);
      room.players.set(socket.userId, {
        id: socket.userId,
        username: socket.username,
        avatar: socket.user.avatar,
        level: socket.user.level,
        ready: false,
        score: 0,
        lines: 0,
        isHost: room.players.size === 0 // 第一个加入的玩家是房主
      });
      
      // 通知房间内其他玩家
      socket.to(`game_${roomId}`).emit('player_joined_game', {
        playerId: socket.userId,
        playerName: socket.username,
        avatar: socket.user.avatar,
        level: socket.user.level,
        isHost: room.players.get(socket.userId).isHost
      });
      
      // 发送房间信息给新加入的玩家
      socket.emit('room_info', {
        roomId,
        gameType,
        players: Array.from(room.players.values()),
        gameState: room.gameState
      });
      
      console.log(`用户 ${socket.username} 加入游戏房间 ${roomId}`);
    });

    // 处理玩家准备状态
    socket.on('player_ready', (data) => {
      const { roomId, isReady } = data;
      const room = gameRooms.get(roomId);
      
      if (room && room.players.has(socket.userId)) {
        room.players.get(socket.userId).ready = isReady;
        
        // 通知房间内其他玩家
        socket.to(`game_${roomId}`).emit('player_ready_status', {
          playerId: socket.userId,
          playerName: socket.username,
          isReady
        });
        
        // 检查是否所有玩家都准备好了
        const allReady = Array.from(room.players.values()).every(p => p.ready);
        if (allReady && room.players.size >= 2) {
          room.gameState = 'ready';
          io.to(`game_${roomId}`).emit('all_players_ready', {
            roomId,
            countdown: 5
          });
        }
        
        console.log(`用户 ${socket.username} ${isReady ? '准备' : '取消准备'}`);
      }
    });

    // 处理游戏开始
    socket.on('start_game', (data) => {
      const { roomId } = data;
      const room = gameRooms.get(roomId);
      
      if (room && room.players.has(socket.userId)) {
        const player = room.players.get(socket.userId);
        if (player.isHost) {
          room.gameState = 'playing';
          room.startTime = new Date();
          
          io.to(`game_${roomId}`).emit('game_started', {
            roomId,
            startTime: room.startTime
          });
          
          console.log(`游戏房间 ${roomId} 开始游戏`);
        }
      }
    });

    // 处理游戏数据更新
    socket.on('game_update', (data) => {
      const { roomId, score, lines, level } = data;
      const room = gameRooms.get(roomId);
      
      if (room && room.players.has(socket.userId)) {
        const player = room.players.get(socket.userId);
        player.score = score;
        player.lines = lines;
        player.level = level;
        
        // 广播给房间内其他玩家
        socket.to(`game_${roomId}`).emit('player_game_update', {
          playerId: socket.userId,
          playerName: socket.username,
          score,
          lines,
          level
        });
      }
    });

    // 处理游戏结束
    socket.on('game_over', (data) => {
      const { roomId, finalScore, result } = data;
      const room = gameRooms.get(roomId);
      
      if (room && room.players.has(socket.userId)) {
        const player = room.players.get(socket.userId);
        player.score = finalScore;
        player.gameResult = result;
        
        // 更新用户游戏统计
        User.updateGameStats(socket.userId, result, finalScore);
        
        // 通知房间内其他玩家
        socket.to(`game_${roomId}`).emit('player_game_over', {
          playerId: socket.userId,
          playerName: socket.username,
          finalScore,
          result
        });
        
        // 检查是否所有玩家都结束了
        const allFinished = Array.from(room.players.values()).every(p => p.gameResult);
        if (allFinished) {
          room.gameState = 'finished';
          io.to(`game_${roomId}`).emit('game_finished', {
            roomId,
            results: Array.from(room.players.values()).map(p => ({
              id: p.id,
              username: p.username,
              score: p.score,
              result: p.gameResult
            }))
          });
        }
      }
    });

    // 处理聊天消息
    socket.on('chat_message', (data) => {
      const { roomId, message } = data;
      io.to(`game_${roomId}`).emit('new_message', {
        userId: socket.userId,
        username: socket.username,
        avatar: socket.user.avatar,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // 处理好友请求
    socket.on('friend_request', (data) => {
      const { targetUserId } = data;
      const targetSocket = onlineUsers.get(targetUserId);
      
      if (targetSocket) {
        targetSocket.emit('friend_request_received', {
          fromUserId: socket.userId,
          fromUsername: socket.username,
          fromAvatar: socket.user.avatar
        });
      }
    });

    // 处理断开连接
    socket.on('disconnect', () => {
      console.log(`用户 ${socket.username} (ID: ${socket.userId}) 已断开连接`);
      
      // 从在线用户列表中移除
      onlineUsers.delete(socket.userId);
      
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
            console.log(`游戏房间 ${roomId} 已删除（无玩家）`);
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

  // 定期清理断开的连接
  setInterval(() => {
    onlineUsers.forEach((socket, userId) => {
      if (!socket.connected) {
        onlineUsers.delete(userId);
        console.log(`清理断开的连接: 用户 ${userId}`);
      }
    });
  }, 30000); // 每30秒检查一次
};

module.exports = socketHandler; 
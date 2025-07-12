const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RoomService = require('../services/roomService');

// 在线用户管理
const onlineUsers = new Map(); // userId -> socket
const gameRooms = new Map(); // roomId -> roomData (内存缓存)

const socketHandler = (io) => {
  // 身份验证中间件
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    // 强制要求token认证
    if (!token) {
      console.log('❌ Socket连接失败：缺少认证token');
      return next(new Error('Authentication required'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // 获取用户信息
      const user = await User.findByPk(decoded.userId);
      if (!user || user.status !== 'active') {
        console.log('❌ Socket连接失败：用户不存在或状态异常');
        return next(new Error('User not found or inactive'));
      }
      
      socket.userId = user.id;
      socket.username = user.username;
      socket.user = user;
      socket.isTestMode = false;
      
      console.log(`✅ Socket认证成功：用户 ${user.username} (ID: ${user.id})`);
      next();
    } catch (error) {
      console.log('❌ Socket认证失败：', error.message);
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
    socket.on('join_game_room', async (data) => {
      const { roomId, gameType } = data;
      const roomIdStr = String(roomId);
      
      console.log(`🔧 用户 ${socket.username} 尝试加入房间 ${roomIdStr}`);
      
      try {
        // 离开之前的房间
        socket.rooms.forEach(room => {
          if (room.startsWith('game_')) {
            socket.leave(room);
          }
        });
        
        socket.join(`game_${roomIdStr}`);
        
        // 从roomId中提取gameId
        // roomId格式: "gameId_roomNumber" 例如: "2_7" 表示贪吃蛇游戏房间7
        let gameId = 1; // 默认俄罗斯方块
        if (roomIdStr.includes('_')) {
          const parts = roomIdStr.split('_');
          if (parts.length >= 2) {
            gameId = parseInt(parts[0]) || 1;
          }
        }
        
        // 游戏类型映射
        const gameTypeMap = {
          1: '俄罗斯方块',
          2: '贪吃蛇',
          3: '打砖块',
          4: '2048',
          5: '扫雷',
          6: '五子棋'
        };
        
        const actualGameType = gameTypeMap[gameId] || gameType || '俄罗斯方块';
        
        // 检查房间是否存在，不存在则创建
        let room = await RoomService.getRoom(roomIdStr);
        if (!room) {
          room = await RoomService.createRoom({
            roomId: roomIdStr,
            name: `${actualGameType}房间${roomIdStr}`,
            gameId: gameId, // 使用正确的游戏ID
            creatorId: socket.userId,
            creatorName: socket.username,
            creatorAvatar: socket.user.avatar,
            creatorLevel: socket.user.level,
            maxPlayers: 2
          });
        }
        
        // 添加玩家到房间
        await RoomService.addPlayerToRoom(roomIdStr, {
          userId: socket.userId,
          username: socket.username,
          avatar: socket.user.avatar,
          level: socket.user.level,
          isHost: room.creatorId === socket.userId,
          isReady: false
        });
        
        // 更新内存缓存
        const roomData = await RoomService.getRoom(roomIdStr);
        gameRooms.set(roomIdStr, {
          gameType: actualGameType,
          players: new Map(roomData.players.map(p => [p.userId, {
            id: p.userId,
            username: p.username,
            avatar: p.avatar,
            level: p.level,
            ready: p.isReady,
            score: p.score,
            lines: p.lines,
            isHost: p.isHost
          }])),
          gameState: roomData.status,
          startTime: roomData.startTime,
          createdAt: roomData.createdAt
        });
        
        // 通知房间内其他玩家
        socket.to(`game_${roomIdStr}`).emit('player_joined_game', {
          playerId: socket.userId,
          playerName: socket.username,
          avatar: socket.user.avatar,
          level: socket.user.level,
          isHost: room.creatorId === socket.userId
        });
        
        // 发送房间信息给新加入的玩家
        socket.emit('room_info', {
          roomId: roomIdStr,
          gameType: actualGameType,
          players: Array.from(gameRooms.get(roomIdStr).players.values()),
          gameState: roomData.status
        });
        
        console.log(`✅ 用户 ${socket.username} 成功加入游戏房间 ${roomIdStr} (游戏ID: ${gameId}, 类型: ${actualGameType})`);
        
      } catch (error) {
        console.error('❌ 加入房间失败:', error);
        socket.emit('room_error', { message: error.message });
      }
    });

    // 处理玩家准备状态
    socket.on('player_ready', async (data) => {
      const { roomId, isReady } = data;
      const roomIdStr = String(roomId);
      
      try {
        console.log(`🔧 用户 ${socket.username} ${isReady ? '准备' : '取消准备'}`);
        
        // 更新数据库中的准备状态
        const { player, allReady } = await RoomService.updatePlayerReady(roomIdStr, socket.userId, isReady);
        
        // 更新内存缓存
        const room = gameRooms.get(roomIdStr);
        if (room && room.players.has(socket.userId)) {
          room.players.get(socket.userId).ready = isReady;
          
          if (allReady) {
            room.gameState = 'ready';
          } else if (room.gameState === 'ready') {
            room.gameState = 'waiting';
          }
        }
        
        // 通知房间内其他玩家
        socket.to(`game_${roomIdStr}`).emit('player_ready_status', {
          playerId: socket.userId,
          playerName: socket.username,
          isReady
        });
        
        // 如果所有玩家都准备好了，发送倒计时
        if (allReady) {
          io.to(`game_${roomIdStr}`).emit('all_players_ready', {
            roomId: roomIdStr,
            countdown: 5
          });
        }
        
        console.log(`✅ 准备状态更新成功: ${socket.username} ${isReady ? '准备' : '取消准备'}`);
        
      } catch (error) {
        console.error('❌ 更新准备状态失败:', error);
        socket.emit('room_error', { message: error.message });
      }
    });

    // 处理游戏开始
    socket.on('start_game', async (data) => {
      const { roomId } = data;
      const roomIdStr = String(roomId);
      
      try {
        await RoomService.startGame(roomIdStr, socket.userId);
        
        // 更新内存缓存
        const room = gameRooms.get(roomIdStr);
        if (room) {
          room.gameState = 'playing';
          room.startTime = new Date();
        }
        
        io.to(`game_${roomIdStr}`).emit('game_started', {
          roomId: roomIdStr,
          startTime: new Date()
        });
        
        console.log(`✅ 游戏房间 ${roomIdStr} 开始游戏`);
        
      } catch (error) {
        console.error('❌ 开始游戏失败:', error);
        socket.emit('room_error', { message: error.message });
      }
    });

    // 处理游戏数据更新
    socket.on('game_update', (data) => {
      const { roomId, score, lines, level } = data;
      const roomIdStr = String(roomId);
      const room = gameRooms.get(roomIdStr);
      
      if (room && room.players.has(socket.userId)) {
        const player = room.players.get(socket.userId);
        player.score = score;
        player.lines = lines;
        player.level = level;
        
        // 广播给房间内其他玩家
        socket.to(`game_${roomIdStr}`).emit('player_game_update', {
          playerId: socket.userId,
          playerName: socket.username,
          score,
          lines,
          level
        });
      }
    });

    // 处理游戏结束
    socket.on('game_over', async (data) => {
      const { roomId, finalScore, result } = data;
      const roomIdStr = String(roomId);
      
      try {
        // 更新数据库
        await RoomService.endGame(roomIdStr, [{
          userId: socket.userId,
          score: finalScore,
          result
        }]);
        
        // 更新内存缓存
        const room = gameRooms.get(roomIdStr);
        if (room && room.players.has(socket.userId)) {
          const player = room.players.get(socket.userId);
          player.score = finalScore;
          player.gameResult = result;
          room.gameState = 'finished';
        }
        
        // 通知房间内其他玩家
        socket.to(`game_${roomIdStr}`).emit('player_game_over', {
          playerId: socket.userId,
          playerName: socket.username,
          finalScore,
          result
        });
        
        console.log(`✅ 游戏结束: ${socket.username} 得分 ${finalScore}`);
        
      } catch (error) {
        console.error('❌ 游戏结束处理失败:', error);
      }
    });

    // 处理断开连接
    socket.on('disconnect', async () => {
      console.log(`用户 ${socket.username} (ID: ${socket.userId}) 断开连接`);
      
      // 从在线用户列表中移除
      onlineUsers.delete(socket.userId);
      
      // 处理用户离开房间
      for (const [roomId, room] of gameRooms.entries()) {
        if (room.players.has(socket.userId)) {
          try {
            await RoomService.leaveRoom(roomId, socket.userId);
            room.players.delete(socket.userId);
            
            // 通知房间内其他玩家
            socket.to(`game_${roomId}`).emit('player_left_game', {
              playerId: socket.userId,
              playerName: socket.username
            });
            
            console.log(`✅ 用户 ${socket.username} 离开房间 ${roomId}`);
          } catch (error) {
            console.error('❌ 处理用户离开房间失败:', error);
          }
        }
      }
    });
  });
};

module.exports = socketHandler; 
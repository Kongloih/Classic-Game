const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BattleRoom = require('../models/BattleRoom');
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

    // 测试连接事件
    socket.on('test_connection', (data) => {
      console.log('=== [test_connection] 收到前端测试连接 ===');
      console.log('📥 测试数据:', data);
      console.log('✅ 前端socket连接正常');
      socket.emit('test_connection_response', { 
        message: '后端连接正常',
        timestamp: new Date().toISOString(),
        userId: socket.userId,
        username: socket.username
      });
    });

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

    // 处理进入房间
    socket.on('enter_room', async (data) => {
      const { roomId, gameId } = data;
      console.log('=== [enter_room] 开始处理前端请求 ===');
      console.log('📥 收到前端参数:', { roomId, gameId });
      console.log('📥 参数类型:', { 
        roomId: typeof roomId, 
        gameId: typeof gameId
      });
      
      try {
        // 导入必要的模型和服务
        const BattleService = require('../services/battleService');
        
        // 确保参数类型正确
        const parsedRoomId = parseInt(roomId);
        const parsedGameId = parseInt(gameId);
        
        console.log('🔧 解析后的参数:', { parsedRoomId, parsedGameId });
        
        // 调用进入房间服务
        console.log('🔧 调用userEnterRoom服务...');
        const result = await BattleService.userEnterRoom(socket.userId, parsedRoomId);
        
        console.log('✅ userEnterRoom执行成功:', result);
        
        // 发送成功响应
        const successResponse = {
          roomId: parsedRoomId,
          gameId: parsedGameId,
          room: result.room,
          previousTableInfo: result.previousTableInfo
        };
        
        console.log('📤 发送成功响应:', successResponse);
        socket.emit('enter_room_success', successResponse);
        
        // 广播给其他用户
        const broadcastData = {
          roomId: parsedRoomId,
          userId: socket.userId,
          username: socket.username,
          action: 'entered_room'
        };
        
        console.log('📤 广播给其他用户:', broadcastData);
        socket.broadcast.emit('user_entered_room', broadcastData);
        
        console.log('=== [enter_room] 处理完成 ===');
      } catch (error) {
        console.error('[enter_room] ❌ 进入房间失败:', error);
        console.error('[enter_room] ❌ 错误堆栈:', error.stack);
        socket.emit('enter_room_failed', {
          roomId: parsedRoomId,
          message: error.message || '进入房间失败'
        });
      }
    });

    // 处理加入桌子
    socket.on('join_table', async (data) => {
      const { tableId, roomId, gameId, seatNumber, userId, username } = data;
      console.log('=== [join_table] 开始处理前端请求 ===');
      console.log('📥 收到前端参数:', { tableId, roomId, gameId, seatNumber, userId, username });
      console.log('📥 参数类型:', { 
        tableId: typeof tableId, 
        roomId: typeof roomId, 
        gameId: typeof gameId,
        seatNumber: typeof seatNumber, 
        userId: typeof userId 
      });
      
      try {
        // 导入必要的模型和服务
        const BattleTable = require('../models/BattleTable');
        const BattleService = require('../services/battleService');
        
        // 确保参数类型正确
        const parsedTableId = parseInt(tableId);
        const parsedRoomId = parseInt(roomId);
        const parsedGameId = parseInt(gameId);
        const parsedSeatNumber = parseInt(seatNumber);
        
        console.log('🔧 解析后的参数:', { parsedTableId, parsedRoomId, parsedGameId, parsedSeatNumber });
        console.log('🔧 解析参数类型:', { 
          parsedTableId: typeof parsedTableId, 
          parsedRoomId: typeof parsedRoomId, 
          parsedGameId: typeof parsedGameId,
          parsedSeatNumber: typeof parsedSeatNumber 
        });
        
        // 查找房间 - 使用roomId和gameId共同查找
        console.log('🔍 开始查找房间...');
        console.log(`🔍 查找条件: room_id = ${parsedRoomId}, game_id = ${parsedGameId}`);
        let room = await BattleRoom.findOne({
          where: { 
            room_id: parsedRoomId,
            game_id: parsedGameId
          }
        });
        console.log('🔍 通过room_id和game_id查找房间结果:', room ? `找到房间 ${room.name} (ID: ${room.id})` : '未找到');
        
        // 如果找不到，尝试通过主键ID查找（兼容性）
        if (!room) {
          console.log('🔍 尝试通过主键ID查找房间...');
          room = await BattleRoom.findByPk(parsedRoomId);
          console.log('🔍 通过主键查找房间结果:', room ? `找到房间 ${room.name} (ID: ${room.id})` : '未找到');
        }
        
        if (!room) {
          console.log(`[join_table] ❌ 房间 ${parsedRoomId} 不存在`);
          socket.emit('join_table_failed', {
            tableId: parsedTableId,
            seatNumber: parsedSeatNumber,
            message: '房间不存在'
          });
          return;
        }
        
        console.log(`[join_table] ✅ 找到房间: ${room.name} (ID: ${room.id}, room_id: ${room.room_id})`);
        
        // 使用房间的主键ID查找桌子
        console.log('🔍 开始查找桌子...');
        const table = await BattleTable.findOne({
          where: { 
            table_id: `table_${parsedTableId}`, // 转换为正确的字符串格式
            room_id: room.id  // 使用房间的主键ID
          }
        });
        
        if (!table) {
          console.log(`[join_table] ❌ 桌子 ${parsedTableId} 在房间 ${parsedRoomId} 中不存在`);
          socket.emit('join_table_failed', {
            tableId: parsedTableId,
            seatNumber: parsedSeatNumber,
            message: '桌子不存在'
          });
          return;
        }
        
        console.log(`[join_table] ✅ 找到桌子:`, {
          id: table.id,
          table_id: table.table_id,
          room_id: table.room_id,
          current_players: table.current_players,
          status: table.status
        });
        
        // 检查座位是否已被占用
        const seatField = `seat_${parsedSeatNumber}_user_id`;
        console.log(`[join_table] 🔍 检查座位字段: ${seatField}`);
        console.log(`[join_table] 🔍 座位当前值: ${table[seatField]}`);
        console.log(`[join_table] 🔍 当前用户ID: ${userId}`);
        
        if (table[seatField] && table[seatField] !== userId) {
          console.log(`[join_table] ❌ 座位 ${parsedSeatNumber} 已被其他用户占用，当前用户ID: ${table[seatField]}`);
          socket.emit('join_table_failed', {
            tableId: parsedTableId,
            seatNumber: parsedSeatNumber,
            message: '座位已被占用'
          });
          return;
        }
        
        // 检查用户是否已在其他座位
        console.log('🔍 检查用户是否已在其他座位...');
        const existingSeat = await BattleService.getUserSeat(userId, table.id);
        console.log(`[join_table] 🔍 用户当前座位检查结果:`, existingSeat);
        
        if (existingSeat && existingSeat === parsedSeatNumber) {
          console.log(`[join_table] ✅ 用户已在该座位 ${existingSeat}，允许刷新状态`);
          // 用户点击的是自己当前所在的座位，允许刷新状态
        } else if (existingSeat && existingSeat !== parsedSeatNumber) {
          console.log(`[join_table] 🔄 用户从座位 ${existingSeat} 切换到座位 ${parsedSeatNumber}（同一张桌子）`);
          // 用户在同一张桌子内切换座位，这是允许的
        }
        
        // 加入座位
        console.log(`[join_table] 🔧 调用userJoinTable...`);
        console.log(`[join_table] 🔧 userJoinTable参数:`, { userId, tableId: table.id, seatNumber: parsedSeatNumber });
        
        const result = await BattleService.userJoinTable(userId, table.id, parsedSeatNumber);
        console.log(`[join_table] ✅ userJoinTable结果:`, result);
        
        // 发送成功响应
        const successResponse = {
          tableId: parsedTableId,
          seatNumber: parsedSeatNumber,
          userId,
          username,
          isSeatSwitch: result.isSeatSwitch,
          isTableSwitch: result.isTableSwitch,
          oldSeat: result.oldSeat,
          oldTableInfo: result.oldTableInfo
        };
        
        console.log(`[join_table] 📤 发送成功响应:`, successResponse);
        socket.emit('join_table_success', successResponse);
        
        // 广播给其他用户
        const broadcastData = {
          tableId: parsedTableId,
          seatNumber: parsedSeatNumber,
          userId,
          username,
          isSeatSwitch: result.isSeatSwitch,
          isTableSwitch: result.isTableSwitch,
          oldSeat: result.oldSeat,
          oldTableInfo: result.oldTableInfo
        };
        
        console.log(`[join_table] 📤 广播给其他用户:`, broadcastData);
        socket.broadcast.emit('player_joined_table', broadcastData);

        // 如果是跨桌子切换，广播离开原桌子的事件
        if (result.isTableSwitch && result.oldTableInfo) {
          const leaveData = {
            tableId: result.oldTableInfo.tableId,
            seatNumber: result.oldTableInfo.seatNumber,
            userId,
            username
          };
          console.log(`[join_table] 📤 广播跨桌子切换离开事件:`, leaveData);
          socket.broadcast.emit('player_left_table', leaveData);
        }
        
        console.log('=== [join_table] 处理完成 ===');
      } catch (error) {
        console.error('[join_table] ❌ 加入桌子失败:', error);
        console.error('[join_table] ❌ 错误堆栈:', error.stack);
        socket.emit('join_table_failed', {
          tableId: parsedTableId,
          seatNumber: parsedSeatNumber,
          message: error.message || '加入桌子失败'
        });
      }
    });

    // 处理离开桌子
    socket.on('leave_table', async (data) => {
      const { tableId, roomId, userId } = data;
      
      try {
        console.log(`🔧 用户 ${socket.username} 尝试离开桌子 ${tableId}，房间 ${roomId}`);
        
        // 导入必要的模型和服务
        const BattleTable = require('../models/BattleTable');
        const BattleService = require('../services/battleService');
        
        // 查找桌子，同时检查table_id和room_id
        // 首先尝试通过主键ID查找房间
        let room = await BattleRoom.findByPk(roomId);
        
        // 如果找不到，尝试通过room_id字段查找
        if (!room) {
          room = await BattleRoom.findOne({
            where: { room_id: roomId }
          });
        }
        
        if (!room) {
          console.log(`❌ 房间 ${roomId} 不存在`);
          return;
        }
        
        // 使用房间的主键ID查找桌子
        const table = await BattleTable.findOne({
          where: { 
            table_id: tableId,
            room_id: room.id  // 使用房间的主键ID
          }
        });
        
        if (!table) {
          console.log(`❌ 桌子 ${tableId} 在房间 ${roomId} 中不存在`);
          return;
        }
        
        // 获取用户当前座位
        const seatNumber = await BattleService.getUserSeat(userId, table.id);
        if (!seatNumber) {
          console.log(`❌ 用户不在该桌子中`);
          return;
        }
        
        // 离开座位
        await BattleService.userLeaveTable(userId, table.id, seatNumber);
        
        console.log(`✅ 用户 ${socket.username} 成功离开桌子 ${tableId} 座位 ${seatNumber}`);
        
        // 广播给其他用户
        socket.broadcast.emit('player_left_table', {
          tableId,
          seatNumber,
          userId,
          username: socket.username
        });
        
      } catch (error) {
        console.error('❌ 离开桌子失败:', error);
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
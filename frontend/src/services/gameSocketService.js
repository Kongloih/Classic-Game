import { socketService } from './socketService';

class GameSocketService {
  constructor() {
    this.socket = socketService;
    this.roomId = null;
    this.gameType = null;
    this.callbacks = {
      onGameStart: null,
      onGameStateUpdate: null,
      onOpponentStateUpdate: null,
      onGameOver: null,
      onPlayerJoined: null,
      onPlayerLeft: null,
      onChatMessage: null,
    };
  }

  // 连接到游戏房间
  connectToGameRoom(roomId, gameType) {
    this.roomId = roomId;
    this.gameType = gameType;
    
    this.socket.emit('join_game_room', {
      roomId,
      gameType,
      timestamp: Date.now()
    });

    this.setupEventListeners();
  }

  // 设置事件监听器
  setupEventListeners() {
    // 游戏开始
    this.socket.on('game_started', (data) => {
      console.log('游戏开始:', data);
      if (this.callbacks.onGameStart) {
        this.callbacks.onGameStart(data);
      }
    });

    // 对手游戏状态更新
    this.socket.on('opponent_state_update', (data) => {
      console.log('对手状态更新:', data);
      if (this.callbacks.onOpponentStateUpdate) {
        this.callbacks.onOpponentStateUpdate(data);
      }
    });

    // 游戏结束
    this.socket.on('game_over', (data) => {
      console.log('游戏结束:', data);
      if (this.callbacks.onGameOver) {
        this.callbacks.onGameOver(data);
      }
    });

    // 玩家加入
    this.socket.on('player_joined_game', (data) => {
      console.log('玩家加入游戏:', data);
      if (this.callbacks.onPlayerJoined) {
        this.callbacks.onPlayerJoined(data);
      }
    });

    // 玩家离开
    this.socket.on('player_left_game', (data) => {
      console.log('玩家离开游戏:', data);
      if (this.callbacks.onPlayerLeft) {
        this.callbacks.onPlayerLeft(data);
      }
    });

    // 聊天消息
    this.socket.on('game_chat_message', (data) => {
      console.log('游戏聊天消息:', data);
      if (this.callbacks.onChatMessage) {
        this.callbacks.onChatMessage(data);
      }
    });
  }

  // 发送游戏状态
  sendGameState(gameState) {
    if (!this.roomId) return;

    this.socket.emit('game_state_update', {
      roomId: this.roomId,
      gameType: this.gameType,
      gameState,
      timestamp: Date.now()
    });
  }

  // 发送准备状态
  sendReadyStatus(isReady) {
    if (!this.roomId) return;

    this.socket.emit('player_ready', {
      roomId: this.roomId,
      gameType: this.gameType,
      isReady,
      timestamp: Date.now()
    });
  }

  // 发送游戏开始请求
  sendGameStartRequest() {
    if (!this.roomId) return;

    this.socket.emit('request_game_start', {
      roomId: this.roomId,
      gameType: this.gameType,
      timestamp: Date.now()
    });
  }

  // 发送游戏结束
  sendGameOver(finalScore) {
    if (!this.roomId) return;

    this.socket.emit('game_over', {
      roomId: this.roomId,
      gameType: this.gameType,
      finalScore,
      timestamp: Date.now()
    });
  }

  // 发送聊天消息
  sendChatMessage(message) {
    if (!this.roomId) return;

    this.socket.emit('game_chat_message', {
      roomId: this.roomId,
      gameType: this.gameType,
      message,
      timestamp: Date.now()
    });
  }

  // 离开游戏房间
  leaveGameRoom() {
    if (!this.roomId) return;

    this.socket.emit('leave_game_room', {
      roomId: this.roomId,
      gameType: this.gameType,
      timestamp: Date.now()
    });

    this.cleanup();
  }

  // 清理事件监听器
  cleanup() {
    this.socket.off('game_started');
    this.socket.off('opponent_state_update');
    this.socket.off('game_over');
    this.socket.off('player_joined_game');
    this.socket.off('player_left_game');
    this.socket.off('game_chat_message');

    this.roomId = null;
    this.gameType = null;
  }

  // 设置回调函数
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = callback;
    }
  }

  // 移除回调函数
  off(event) {
    if (this.callbacks.hasOwnProperty(event)) {
      this.callbacks[event] = null;
    }
  }
}

export const gameSocketService = new GameSocketService(); 
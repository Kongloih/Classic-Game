import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isTestMode = false;
  }

  async connect(testMode = false) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        
        // 强制要求token认证
        if (!token) {
          reject(new Error('Authentication required. Please login first.'));
          return;
        }

        const socketOptions = {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          auth: { token }
        };

        this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', socketOptions);

        this.socket.on('connect', () => {
          console.log('✅ WebSocket连接成功');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.socket);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 WebSocket连接断开:', reason);
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // 服务器主动断开，尝试重新连接
            this.socket.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket连接错误:', error);
          this.isConnected = false;
          
          if (error.message === 'Authentication error') {
            // 认证失败，清除token并重定向到登录页
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          
          reject(error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 WebSocket重连尝试 ${attemptNumber}`);
          this.reconnectAttempts = attemptNumber;
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ WebSocket重连失败');
          this.isConnected = false;
        });

      } catch (error) {
        console.error('❌ 创建WebSocket连接失败:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    } else {
      console.warn('WebSocket not connected, cannot listen to event:', event);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // 获取连接状态
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts
    };
  }

  // 重新连接
  async reconnect() {
    this.disconnect();
    return this.connect();
  }
}

// 创建单例实例
export const socketService = new SocketService();
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  async connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          reject(new Error('No authentication token found'));
          return;
        }

        this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
          auth: { token },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.socket);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('WebSocket disconnected:', reason);
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // 服务器主动断开，尝试重新连接
            this.socket.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          this.isConnected = false;
          
          if (error.message === 'Authentication error') {
            // 认证失败，清除token并重定向到登录页
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          
          reject(error);
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`WebSocket reconnection attempt ${attemptNumber}`);
          this.reconnectAttempts = attemptNumber;
        });

        this.socket.on('reconnect_failed', () => {
          console.error('WebSocket reconnection failed');
          this.isConnected = false;
        });

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
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
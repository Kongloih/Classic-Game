// Socket服务 - 模拟实现
class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.connected = false;
  }

  connect() {
    console.log('🔌 模拟Socket连接');
    this.connected = true;
    this.emit('connect');
  }

  disconnect() {
    console.log('🔌 模拟Socket断开');
    this.connected = false;
    this.emit('disconnect');
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const socketService = new SocketService();
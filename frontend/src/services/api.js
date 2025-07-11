import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除token并重定向到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 游戏相关API
export const gameApi = {
  // 获取游戏大厅数据
  getGameHall: (gameId) => api.get(`/games/hall/${gameId}`),
  
  // 获取在线用户列表
  getOnlineUsers: (limit = 20) => api.get('/games/online-users', { params: { limit } }),
  
  // 获取用户游戏统计
  getUserStats: (userId) => api.get(`/games/stats/${userId}`),
  
  // 获取游戏列表
  getGames: (params) => api.get('/games', { params }),
  
  // 获取游戏详情
  getGame: (gameId) => api.get(`/games/${gameId}`),
};

// 用户相关API
export const userApi = {
  // 获取用户信息
  getProfile: () => api.get('/user/profile'),
  
  // 更新用户信息
  updateProfile: (data) => api.put('/user/profile', data),
  
  // 获取用户游戏记录
  getGameRecords: (params) => api.get('/user/game-records', { params }),
};

// 对战相关API
export const battleApi = {
  // 创建对战房间
  createRoom: (data) => api.post('/battle/rooms', data),
  
  // 获取房间列表
  getRooms: (params) => api.get('/battle/rooms', { params }),
  
  // 获取房间详情
  getRoom: (roomId) => api.get(`/battle/rooms/${roomId}`),
  
  // 加入房间
  joinRoom: (roomId) => api.post(`/battle/rooms/${roomId}/join`),
  
  // 离开房间
  leaveRoom: (roomId) => api.post(`/battle/rooms/${roomId}/leave`),
};

// 社交相关API
export const socialApi = {
  // 获取好友列表
  getFriends: () => api.get('/social/friends'),
  
  // 发送好友请求
  sendFriendRequest: (userId) => api.post('/social/friend-requests', { targetUserId: userId }),
  
  // 接受好友请求
  acceptFriendRequest: (requestId) => api.put(`/social/friend-requests/${requestId}/accept`),
  
  // 拒绝好友请求
  rejectFriendRequest: (requestId) => api.put(`/social/friend-requests/${requestId}/reject`),
  
  // 删除好友
  removeFriend: (friendId) => api.delete(`/social/friends/${friendId}`),
};

// 排行榜相关API
export const leaderboardApi = {
  // 获取排行榜
  getLeaderboard: (type = 'level', limit = 50) => 
    api.get('/leaderboard', { params: { type, limit } }),
  
  // 获取游戏排行榜
  getGameLeaderboard: (gameId, type = 'score', limit = 50) => 
    api.get(`/leaderboard/game/${gameId}`, { params: { type, limit } }),
};

export default api; 
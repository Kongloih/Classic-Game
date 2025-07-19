import axios from 'axios';

console.log('[API] api.js模块已被加载');
console.log('[API] api.js模块已被加载');
console.log('[API] api.js模块已被加载');
console.log('[API] api.js模块已被加载');
console.log('[API] api.js模块已被加载');
console.log('[API] api.js模块已被加载');

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    console.log(
      `[Request] ${new Date().toISOString()} | ${config.method?.toUpperCase()} ${config.url}`
    );
    console.debug('Request Config:', {
      params: config.params,
      data: config.data
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[Request Interceptor Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    console.log(
      `[Response] ${new Date().toISOString()} | ${response.config.method?.toUpperCase()} ${response.config.url} | Status ${response.status}`
    );
    console.debug('Response Data:', response.data);
    return response.data;
  },
  (error) => {
    const { config, response } = error;
    const errorMessage = response?.data?.message || error.message;
    
    console.error(
      `[API Error] ${config?.method?.toUpperCase()} ${config?.url} | Status ${response?.status || 'N/A'}`
    );
    console.error('Error Details:', {
      message: errorMessage,
      config: error.config
    });

    if (error.response?.status === 401) {
      console.warn('[Auth] Token expired or invalid, redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 游戏相关API（添加函数调用日志）
export const gameApi = {
  getGameHall: (gameId, testMode = false) => {
    console.log(`[API] getGameHall(gameId=${gameId}, testMode=${testMode})`);
    const params = testMode ? { testMode: 'true' } : {};
    return api.get(`/games/hall/${gameId}`, { params });
  },
  
  getOnlineUsers: (limit = 20) => {
    console.log(`[API] getOnlineUsers(limit=${limit})`);
    return api.get('/games/online-users', { params: { limit } });
  },
  
  getUserStats: (userId) => {
    console.log(`[API] getUserStats(userId=${userId})`);
    return api.get(`/games/stats/${userId}`);
  },
  
  getGames: (params) => {
    console.log(`[API] getGames(${JSON.stringify(params)})`);
    return api.get('/games', { params });
  },
  
  getGame: (gameId) => {
    console.log(`[API] getGame(gameId=${gameId})`);
    return api.get(`/games/${gameId}`);
  },
};

// 认证相关API（添加函数调用日志）
export const authApi = {
  register: (userData) => {
    console.log(`[API] register(userData=${JSON.stringify(userData)})`);
    return api.post('/auth/register', userData);
  },
  
  login: (loginData) => {
    console.log(`[API] login(loginData=${JSON.stringify(loginData)})`);
    return api.post('/auth/login', loginData);
  },
  
  sendSms: (smsData) => {
    console.log(`[API] sendSms(smsData=${JSON.stringify(smsData)})`);
    return api.post('/auth/send-sms', smsData);
  },
  
  getAuthStatus: () => {
    console.log(`[API] getAuthStatus()`);
    return api.get('/auth/status');
  },
  
  logout: () => {
    console.log(`[API] logout()`);
    return api.post('/auth/logout');
  },
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
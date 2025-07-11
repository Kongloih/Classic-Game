// 后端Mock数据管理模块

// 用户相关Mock数据
const mockUsers = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: '$2a$10$hashedPassword',
    avatar: 'https://via.placeholder.com/150',
    level: 10,
    experience: 1000,
    coins: 500,
    role: 'user',
    isActive: true,
    emailVerified: true,
    lastLoginAt: '2023-12-01T10:00:00.000Z',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-12-01T10:00:00.000Z'
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$hashedPassword',
    avatar: 'https://via.placeholder.com/150',
    level: 50,
    experience: 10000,
    coins: 5000,
    role: 'admin',
    isActive: true,
    emailVerified: true,
    lastLoginAt: '2023-12-01T09:30:00.000Z',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-12-01T09:30:00.000Z'
  },
  {
    id: 3,
    username: 'newuser',
    email: 'new@example.com',
    password: '$2a$10$hashedPassword',
    avatar: 'https://via.placeholder.com/150',
    level: 1,
    experience: 0,
    coins: 100,
    role: 'user',
    isActive: true,
    emailVerified: false,
    lastLoginAt: '2023-12-01T08:30:00.000Z',
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2023-12-01T08:30:00.000Z'
  },
  {
    id: 4,
    username: 'premium',
    email: 'premium@example.com',
    password: '$2a$10$hashedPassword',
    avatar: 'https://via.placeholder.com/150',
    level: 25,
    experience: 5000,
    coins: 2000,
    role: 'premium',
    isActive: true,
    emailVerified: true,
    lastLoginAt: '2023-12-01T09:45:00.000Z',
    createdAt: '2023-06-01T00:00:00.000Z',
    updatedAt: '2023-12-01T09:45:00.000Z'
  }
];

// 游戏相关Mock数据
const mockGames = [
  {
    id: 1,
    title: '俄罗斯方块',
    description: '经典的俄罗斯方块游戏，考验你的空间思维能力',
    image: '/images/tetris.jpg',
    players: '1-2人',
    difficulty: '中等',
    category: '益智',
    rating: 4.8,
    playCount: 15420,
    onlinePlayers: 234,
    minLevel: 1,
    maxLevel: 10,
    gameType: 'puzzle',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  },
  {
    id: 2,
    title: '贪吃蛇',
    description: '控制蛇吃食物成长，但不要撞到自己或墙壁',
    image: '/images/snake.jpg',
    players: '1人',
    difficulty: '简单',
    category: '动作',
    rating: 4.5,
    playCount: 12340,
    onlinePlayers: 156,
    minLevel: 1,
    maxLevel: 8,
    gameType: 'action',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  },
  {
    id: 3,
    title: '打砖块',
    description: '用球拍反弹球，击碎所有砖块。考验你的反应速度和策略思维。',
    image: '/images/breakout.jpg',
    players: '1人',
    difficulty: '困难',
    category: '动作',
    rating: 4.7,
    playCount: 9876,
    onlinePlayers: 89,
    minLevel: 5,
    maxLevel: 15,
    gameType: 'action',
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  }
];

// 游戏房间Mock数据
const mockGameRooms = [
  {
    id: 'room_1',
    gameId: 1,
    gameName: '俄罗斯方块',
    players: [
      { id: 1, username: 'player1', ready: true, score: 0 },
      { id: 2, username: 'player2', ready: false, score: 0 }
    ],
    maxPlayers: 2,
    status: 'waiting',
    settings: {
      difficulty: 'normal',
      timeLimit: 300,
      maxLevel: 10
    },
    createdAt: '2023-12-01T10:00:00.000Z',
    updatedAt: '2023-12-01T10:00:00.000Z'
  },
  {
    id: 'room_2',
    gameId: 2,
    gameName: '贪吃蛇',
    players: [
      { id: 1, username: 'player1', ready: true, score: 1500, level: 5 },
      { id: 3, username: 'player3', ready: true, score: 1200, level: 4 }
    ],
    maxPlayers: 2,
    status: 'playing',
    settings: {
      difficulty: 'hard',
      timeLimit: 600,
      maxLevel: 8
    },
    createdAt: '2023-12-01T09:30:00.000Z',
    startedAt: '2023-12-01T09:35:00.000Z',
    updatedAt: '2023-12-01T09:35:00.000Z'
  },
  {
    id: 'room_3',
    gameId: 3,
    gameName: '打砖块',
    players: [
      { id: 1, username: 'player1', ready: true, score: 2500, level: 8, won: true },
      { id: 4, username: 'player4', ready: true, score: 1800, level: 6, won: false }
    ],
    maxPlayers: 2,
    status: 'finished',
    settings: {
      difficulty: 'normal',
      timeLimit: 300,
      maxLevel: 15
    },
    createdAt: '2023-12-01T08:00:00.000Z',
    startedAt: '2023-12-01T08:05:00.000Z',
    endedAt: '2023-12-01T08:15:00.000Z',
    updatedAt: '2023-12-01T08:15:00.000Z'
  }
];

// 分数记录Mock数据
const mockScores = [
  // 俄罗斯方块分数
  {
    id: 1,
    userId: 1,
    gameId: 1,
    score: 5000,
    level: 8,
    time: 300,
    roomId: 'room_1',
    createdAt: '2023-12-01T08:00:00.000Z'
  },
  {
    id: 2,
    userId: 2,
    gameId: 1,
    score: 4500,
    level: 7,
    time: 280,
    roomId: 'room_1',
    createdAt: '2023-12-01T07:30:00.000Z'
  },
  {
    id: 3,
    userId: 3,
    gameId: 1,
    score: 3800,
    level: 6,
    time: 250,
    roomId: 'room_1',
    createdAt: '2023-12-01T07:00:00.000Z'
  },
  // 贪吃蛇分数
  {
    id: 4,
    userId: 1,
    gameId: 2,
    score: 1500,
    level: 5,
    time: 180,
    roomId: 'room_2',
    createdAt: '2023-12-01T09:00:00.000Z'
  },
  {
    id: 5,
    userId: 4,
    gameId: 2,
    score: 1200,
    level: 4,
    time: 150,
    roomId: 'room_2',
    createdAt: '2023-12-01T08:45:00.000Z'
  },
  // 打砖块分数
  {
    id: 6,
    userId: 1,
    gameId: 3,
    score: 2500,
    level: 8,
    time: 240,
    roomId: 'room_3',
    createdAt: '2023-12-01T10:00:00.000Z'
  },
  {
    id: 7,
    userId: 4,
    gameId: 3,
    score: 1800,
    level: 6,
    time: 200,
    roomId: 'room_3',
    createdAt: '2023-12-01T09:45:00.000Z'
  }
];

// 好友关系Mock数据
const mockFriendships = [
  {
    id: 1,
    userId: 1,
    friendId: 2,
    status: 'accepted',
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2023-11-01T00:00:00.000Z'
  },
  {
    id: 2,
    userId: 1,
    friendId: 4,
    status: 'accepted',
    createdAt: '2023-11-05T00:00:00.000Z',
    updatedAt: '2023-11-05T00:00:00.000Z'
  },
  {
    id: 3,
    userId: 1,
    friendId: 3,
    status: 'accepted',
    createdAt: '2023-11-10T00:00:00.000Z',
    updatedAt: '2023-11-10T00:00:00.000Z'
  },
  {
    id: 4,
    userId: 5,
    friendId: 1,
    status: 'pending',
    message: '你好，我想和你成为好友！',
    createdAt: '2023-12-01T09:00:00.000Z',
    updatedAt: '2023-12-01T09:00:00.000Z'
  }
];

// 公会Mock数据
const mockGuilds = [
  {
    id: 1,
    name: '测试公会',
    description: '这是一个测试公会，欢迎加入！',
    avatar: 'https://via.placeholder.com/150',
    level: 5,
    memberCount: 10,
    maxMembers: 50,
    leaderId: 1,
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  }
];

// 公会成员Mock数据
const mockGuildMembers = [
  {
    id: 1,
    guildId: 1,
    userId: 1,
    role: 'leader',
    joinedAt: '2023-11-01T00:00:00.000Z',
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2023-11-01T00:00:00.000Z'
  },
  {
    id: 2,
    guildId: 1,
    userId: 2,
    role: 'officer',
    joinedAt: '2023-11-05T00:00:00.000Z',
    createdAt: '2023-11-05T00:00:00.000Z',
    updatedAt: '2023-11-05T00:00:00.000Z'
  },
  {
    id: 3,
    guildId: 1,
    userId: 4,
    role: 'member',
    joinedAt: '2023-11-10T00:00:00.000Z',
    createdAt: '2023-11-10T00:00:00.000Z',
    updatedAt: '2023-11-10T00:00:00.000Z'
  }
];

// 通知Mock数据
const mockNotifications = [
  {
    id: 1,
    userId: 1,
    type: 'friend_request',
    title: '好友请求',
    message: 'requestuser 想和你成为好友',
    data: JSON.stringify({ userId: 5, username: 'requestuser' }),
    isRead: false,
    createdAt: '2023-12-01T09:00:00.000Z',
    updatedAt: '2023-12-01T09:00:00.000Z'
  },
  {
    id: 2,
    userId: 1,
    type: 'game_invite',
    title: '游戏邀请',
    message: 'admin 邀请你加入俄罗斯方块游戏',
    data: JSON.stringify({ roomId: 'room_1', gameName: '俄罗斯方块' }),
    isRead: false,
    createdAt: '2023-12-01T08:30:00.000Z',
    updatedAt: '2023-12-01T08:30:00.000Z'
  },
  {
    id: 3,
    userId: 1,
    type: 'achievement',
    title: '成就解锁',
    message: '恭喜你解锁了"初级玩家"成就！',
    data: JSON.stringify({ achievementId: 1, achievementName: '初级玩家' }),
    isRead: true,
    createdAt: '2023-12-01T08:00:00.000Z',
    updatedAt: '2023-12-01T08:00:00.000Z'
  }
];

// 成就Mock数据
const mockAchievements = [
  {
    id: 1,
    name: '初级玩家',
    description: '完成第一局游戏',
    icon: '🎮',
    points: 10,
    requirement: 'complete_first_game',
    requirementValue: 1,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    name: '游戏大师',
    description: '在任意游戏中获得1000分',
    icon: '🏆',
    points: 50,
    requirement: 'score_1000',
    requirementValue: 1000,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    name: '社交达人',
    description: '添加5个好友',
    icon: '👥',
    points: 30,
    requirement: 'add_friends',
    requirementValue: 5,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }
];

// 用户成就Mock数据
const mockUserAchievements = [
  {
    id: 1,
    userId: 1,
    achievementId: 1,
    unlockedAt: '2023-12-01T08:00:00.000Z',
    createdAt: '2023-12-01T08:00:00.000Z',
    updatedAt: '2023-12-01T08:00:00.000Z'
  },
  {
    id: 2,
    userId: 1,
    achievementId: 2,
    unlockedAt: '2023-12-01T09:00:00.000Z',
    createdAt: '2023-12-01T09:00:00.000Z',
    updatedAt: '2023-12-01T09:00:00.000Z'
  }
];

// 用户设置Mock数据
const mockUserSettings = [
  {
    id: 1,
    userId: 1,
    theme: 'light',
    language: 'zh-CN',
    soundEnabled: true,
    musicEnabled: true,
    notificationsEnabled: true,
    privacy: JSON.stringify({
      showOnlineStatus: true,
      allowFriendRequests: true,
      allowGameInvites: true
    }),
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  }
];

// 密码重置令牌Mock数据
const mockPasswordResetTokens = [
  {
    id: 1,
    userId: 1,
    token: 'valid-reset-token',
    expiresAt: '2023-12-02T00:00:00.000Z',
    isUsed: false,
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  },
  {
    id: 2,
    userId: 3,
    token: 'expired-reset-token',
    expiresAt: '2023-11-30T00:00:00.000Z',
    isUsed: false,
    createdAt: '2023-11-29T00:00:00.000Z',
    updatedAt: '2023-11-29T00:00:00.000Z'
  }
];

// 邮件验证令牌Mock数据
const mockEmailVerificationTokens = [
  {
    id: 1,
    userId: 3,
    token: 'valid-email-token',
    expiresAt: '2023-12-02T00:00:00.000Z',
    isUsed: false,
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z'
  }
];

// 在线用户Mock数据
const mockOnlineUsers = [
  {
    userId: 1,
    username: 'testuser',
    status: 'online',
    lastSeen: '2023-12-01T10:00:00.000Z',
    currentGame: null,
    socketId: 'socket_1'
  },
  {
    userId: 2,
    username: 'admin',
    status: 'online',
    lastSeen: '2023-12-01T09:30:00.000Z',
    currentGame: null,
    socketId: 'socket_2'
  },
  {
    userId: 4,
    username: 'premium',
    status: 'playing',
    lastSeen: '2023-12-01T09:45:00.000Z',
    currentGame: '俄罗斯方块',
    socketId: 'socket_4'
  }
];

// API响应Mock数据
const mockApiResponses = {
  // 成功响应
  success: (data, message = '操作成功') => ({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }),
  
  // 错误响应
  error: (message = '操作失败', code = 400) => ({
    success: false,
    message,
    code,
    timestamp: new Date().toISOString()
  }),
  
  // 分页响应
  paginated: (data, page = 1, limit = 10, total = 100) => ({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    timestamp: new Date().toISOString()
  }),
  
  // 认证响应
  auth: (user, token) => ({
    success: true,
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        level: user.level,
        experience: user.experience,
        coins: user.coins,
        role: user.role
      },
      token
    },
    timestamp: new Date().toISOString()
  })
};

// 数据库查询结果Mock数据
const mockQueryResults = {
  // 用户查询结果
  findUserByUsername: (username) => {
    return mockUsers.find(user => user.username === username);
  },
  
  findUserById: (id) => {
    return mockUsers.find(user => user.id === id);
  },
  
  findUserByEmail: (email) => {
    return mockUsers.find(user => user.email === email);
  },
  
  // 游戏查询结果
  findGameById: (id) => {
    return mockGames.find(game => game.id === id);
  },
  
  findAllGames: () => {
    return mockGames;
  },
  
  // 分数查询结果
  findScoresByGameId: (gameId) => {
    return mockScores.filter(score => score.gameId === gameId);
  },
  
  findScoresByUserId: (userId) => {
    return mockScores.filter(score => score.userId === userId);
  },
  
  // 房间查询结果
  findRoomById: (roomId) => {
    return mockGameRooms.find(room => room.id === roomId);
  },
  
  findRoomsByGameId: (gameId) => {
    return mockGameRooms.filter(room => room.gameId === gameId);
  },
  
  // 好友查询结果
  findFriendshipsByUserId: (userId) => {
    return mockFriendships.filter(friendship => 
      friendship.userId === userId || friendship.friendId === userId
    );
  },
  
  // 通知查询结果
  findNotificationsByUserId: (userId) => {
    return mockNotifications.filter(notification => notification.userId === userId);
  }
};

// 导出所有Mock数据
module.exports = {
  users: mockUsers,
  games: mockGames,
  gameRooms: mockGameRooms,
  scores: mockScores,
  friendships: mockFriendships,
  guilds: mockGuilds,
  guildMembers: mockGuildMembers,
  notifications: mockNotifications,
  achievements: mockAchievements,
  userAchievements: mockUserAchievements,
  userSettings: mockUserSettings,
  passwordResetTokens: mockPasswordResetTokens,
  emailVerificationTokens: mockEmailVerificationTokens,
  onlineUsers: mockOnlineUsers,
  apiResponses: mockApiResponses,
  queryResults: mockQueryResults
}; 
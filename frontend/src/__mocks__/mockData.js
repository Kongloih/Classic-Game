// 前端Mock数据管理模块

// 用户相关Mock数据
export const mockUsers = {
  // 测试用户
  testUser: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'https://via.placeholder.com/150',
    level: 10,
    experience: 1000,
    coins: 500,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  
  // 管理员用户
  adminUser: {
    id: 2,
    username: 'admin',
    email: 'admin@example.com',
    avatar: 'https://via.placeholder.com/150',
    level: 50,
    experience: 10000,
    coins: 5000,
    role: 'admin',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  
  // 新用户
  newUser: {
    id: 3,
    username: 'newuser',
    email: 'new@example.com',
    avatar: 'https://via.placeholder.com/150',
    level: 1,
    experience: 0,
    coins: 100,
    createdAt: '2023-12-01T00:00:00.000Z',
    updatedAt: '2023-12-01T00:00:00.000Z',
  },
  
  // 高级用户
  premiumUser: {
    id: 4,
    username: 'premium',
    email: 'premium@example.com',
    avatar: 'https://via.placeholder.com/150',
    level: 25,
    experience: 5000,
    coins: 2000,
    role: 'premium',
    createdAt: '2023-06-01T00:00:00.000Z',
    updatedAt: '2023-06-01T00:00:00.000Z',
  }
};

// 游戏相关Mock数据
export const mockGames = {
  // 俄罗斯方块
  tetris: {
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
    controls: {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      down: 'ArrowDown',
      rotate: 'ArrowUp',
      pause: 'Escape'
    }
  },
  
  // 贪吃蛇
  snake: {
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
    controls: {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      pause: 'Space'
    }
  },
  
  // 打砖块
  breakout: {
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
    controls: {
      left: 'ArrowLeft/A',
      right: 'ArrowRight/D',
      pause: 'Space'
    }
  }
};

// 游戏房间Mock数据
export const mockGameRooms = {
  // 等待中的房间
  waitingRoom: {
    id: 'room_1',
    gameId: 1,
    gameName: '俄罗斯方块',
    players: [
      { id: 1, username: 'player1', ready: true, score: 0 },
      { id: 2, username: 'player2', ready: false, score: 0 }
    ],
    maxPlayers: 2,
    status: 'waiting',
    createdAt: '2023-12-01T10:00:00.000Z',
    settings: {
      difficulty: 'normal',
      timeLimit: 300,
      maxLevel: 10
    }
  },
  
  // 游戏中的房间
  activeRoom: {
    id: 'room_2',
    gameId: 2,
    gameName: '贪吃蛇',
    players: [
      { id: 1, username: 'player1', ready: true, score: 1500, level: 5 },
      { id: 3, username: 'player3', ready: true, score: 1200, level: 4 }
    ],
    maxPlayers: 2,
    status: 'playing',
    createdAt: '2023-12-01T09:30:00.000Z',
    startedAt: '2023-12-01T09:35:00.000Z',
    settings: {
      difficulty: 'hard',
      timeLimit: 600,
      maxLevel: 8
    }
  },
  
  // 已结束的房间
  finishedRoom: {
    id: 'room_3',
    gameId: 3,
    gameName: '打砖块',
    players: [
      { id: 1, username: 'player1', ready: true, score: 2500, level: 8, won: true },
      { id: 4, username: 'player4', ready: true, score: 1800, level: 6, won: false }
    ],
    maxPlayers: 2,
    status: 'finished',
    createdAt: '2023-12-01T08:00:00.000Z',
    startedAt: '2023-12-01T08:05:00.000Z',
    endedAt: '2023-12-01T08:15:00.000Z',
    settings: {
      difficulty: 'normal',
      timeLimit: 300,
      maxLevel: 15
    }
  }
};

// 分数记录Mock数据
export const mockScores = {
  // 俄罗斯方块分数
  tetrisScores: [
    { id: 1, userId: 1, gameId: 1, score: 5000, level: 8, time: 300, createdAt: '2023-12-01T08:00:00.000Z' },
    { id: 2, userId: 2, gameId: 1, score: 4500, level: 7, time: 280, createdAt: '2023-12-01T07:30:00.000Z' },
    { id: 3, userId: 3, gameId: 1, score: 3800, level: 6, time: 250, createdAt: '2023-12-01T07:00:00.000Z' }
  ],
  
  // 贪吃蛇分数
  snakeScores: [
    { id: 4, userId: 1, gameId: 2, score: 1500, level: 5, time: 180, createdAt: '2023-12-01T09:00:00.000Z' },
    { id: 5, userId: 4, gameId: 2, score: 1200, level: 4, time: 150, createdAt: '2023-12-01T08:45:00.000Z' },
    { id: 6, userId: 2, gameId: 2, score: 900, level: 3, time: 120, createdAt: '2023-12-01T08:30:00.000Z' }
  ],
  
  // 打砖块分数
  breakoutScores: [
    { id: 7, userId: 1, gameId: 3, score: 2500, level: 8, time: 240, createdAt: '2023-12-01T10:00:00.000Z' },
    { id: 8, userId: 4, gameId: 3, score: 1800, level: 6, time: 200, createdAt: '2023-12-01T09:45:00.000Z' },
    { id: 9, userId: 3, gameId: 3, score: 1200, level: 4, time: 160, createdAt: '2023-12-01T09:30:00.000Z' }
  ]
};

// 排行榜Mock数据
export const mockLeaderboards = {
  // 全球排行榜
  global: [
    { id: 1, username: 'player1', score: 5000, level: 10, rank: 1, gameId: 1 },
    { id: 2, username: 'admin', score: 4800, level: 9, rank: 2, gameId: 1 },
    { id: 3, username: 'premium', score: 4500, level: 8, rank: 3, gameId: 1 },
    { id: 4, username: 'player4', score: 4200, level: 7, rank: 4, gameId: 1 },
    { id: 5, username: 'newuser', score: 3800, level: 6, rank: 5, gameId: 1 }
  ],
  
  // 本周排行榜
  weekly: [
    { id: 1, username: 'player1', score: 2500, level: 8, rank: 1, gameId: 1, week: '2023-W48' },
    { id: 2, username: 'premium', score: 2200, level: 7, rank: 2, gameId: 1, week: '2023-W48' },
    { id: 3, username: 'admin', score: 2000, level: 6, rank: 3, gameId: 1, week: '2023-W48' }
  ],
  
  // 好友排行榜
  friends: [
    { id: 1, username: 'player1', score: 5000, level: 10, rank: 1, gameId: 1, isFriend: true },
    { id: 4, username: 'premium', score: 4500, level: 8, rank: 2, gameId: 1, isFriend: true },
    { id: 3, username: 'newuser', score: 3800, level: 6, rank: 3, gameId: 1, isFriend: true }
  ]
};

// 社交功能Mock数据
export const mockSocial = {
  // 好友列表
  friends: [
    {
      id: 2,
      username: 'admin',
      avatar: 'https://via.placeholder.com/150',
      status: 'online',
      level: 50,
      lastSeen: '2023-12-01T10:00:00.000Z',
      isOnline: true
    },
    {
      id: 4,
      username: 'premium',
      avatar: 'https://via.placeholder.com/150',
      status: 'playing',
      level: 25,
      lastSeen: '2023-12-01T09:45:00.000Z',
      isOnline: true,
      currentGame: '俄罗斯方块'
    },
    {
      id: 3,
      username: 'newuser',
      avatar: 'https://via.placeholder.com/150',
      status: 'offline',
      level: 1,
      lastSeen: '2023-12-01T08:30:00.000Z',
      isOnline: false
    }
  ],
  
  // 好友请求
  friendRequests: [
    {
      id: 1,
      fromUser: {
        id: 5,
        username: 'requestuser',
        avatar: 'https://via.placeholder.com/150',
        level: 5
      },
      message: '你好，我想和你成为好友！',
      createdAt: '2023-12-01T09:00:00.000Z'
    }
  ],
  
  // 公会
  guilds: [
    {
      id: 1,
      name: '测试公会',
      description: '这是一个测试公会，欢迎加入！',
      avatar: 'https://via.placeholder.com/150',
      level: 5,
      memberCount: 10,
      maxMembers: 50,
      leader: { id: 1, username: 'player1' },
      members: [
        { id: 1, username: 'player1', role: 'leader', joinedAt: '2023-11-01T00:00:00.000Z' },
        { id: 2, username: 'admin', role: 'officer', joinedAt: '2023-11-05T00:00:00.000Z' },
        { id: 4, username: 'premium', role: 'member', joinedAt: '2023-11-10T00:00:00.000Z' }
      ],
      createdAt: '2023-11-01T00:00:00.000Z'
    }
  ]
};

// 通知Mock数据
export const mockNotifications = [
  {
    id: 1,
    type: 'friend_request',
    title: '好友请求',
    message: 'requestuser 想和你成为好友',
    data: { userId: 5, username: 'requestuser' },
    isRead: false,
    createdAt: '2023-12-01T09:00:00.000Z'
  },
  {
    id: 2,
    type: 'game_invite',
    title: '游戏邀请',
    message: 'admin 邀请你加入俄罗斯方块游戏',
    data: { roomId: 'room_1', gameName: '俄罗斯方块' },
    isRead: false,
    createdAt: '2023-12-01T08:30:00.000Z'
  },
  {
    id: 3,
    type: 'achievement',
    title: '成就解锁',
    message: '恭喜你解锁了"初级玩家"成就！',
    data: { achievementId: 1, achievementName: '初级玩家' },
    isRead: true,
    createdAt: '2023-12-01T08:00:00.000Z'
  }
];

// 成就Mock数据
export const mockAchievements = [
  {
    id: 1,
    name: '初级玩家',
    description: '完成第一局游戏',
    icon: '🎮',
    points: 10,
    isUnlocked: true,
    unlockedAt: '2023-12-01T08:00:00.000Z'
  },
  {
    id: 2,
    name: '游戏大师',
    description: '在任意游戏中获得1000分',
    icon: '🏆',
    points: 50,
    isUnlocked: true,
    unlockedAt: '2023-12-01T09:00:00.000Z'
  },
  {
    id: 3,
    name: '社交达人',
    description: '添加5个好友',
    icon: '👥',
    points: 30,
    isUnlocked: false,
    progress: 3,
    maxProgress: 5
  }
];

// 设置Mock数据
export const mockSettings = {
  user: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    avatar: 'https://via.placeholder.com/150',
    level: 10,
    experience: 1000,
    coins: 500,
    settings: {
      theme: 'light',
      language: 'zh-CN',
      soundEnabled: true,
      musicEnabled: true,
      notificationsEnabled: true,
      privacy: {
        showOnlineStatus: true,
        allowFriendRequests: true,
        allowGameInvites: true
      }
    }
  }
};

// API响应Mock数据
export const mockApiResponses = {
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
  })
};

// 游戏状态Mock数据
export const mockGameStates = {
  // 俄罗斯方块游戏状态
  tetris: {
    board: Array(20).fill().map(() => Array(10).fill(0)),
    currentPiece: {
      type: 'I',
      position: { x: 4, y: 0 },
      rotation: 0
    },
    nextPiece: {
      type: 'O',
      position: { x: 4, y: 0 },
      rotation: 0
    },
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    paused: false
  },
  
  // 贪吃蛇游戏状态
  snake: {
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 15 },
    direction: 'right',
    score: 0,
    level: 1,
    gameOver: false,
    paused: false
  },
  
  // 打砖块游戏状态
  breakout: {
    paddle: { x: 350, y: 550, width: 100 },
    ball: { x: 400, y: 540, dx: 3, dy: -3 },
    bricks: Array(8).fill().map((_, row) => 
      Array(10).fill().map((_, col) => ({
        x: col * 80,
        y: row * 30 + 50,
        width: 80,
        height: 30,
        visible: true,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][row % 4]
      }))
    ),
    score: 0,
    lives: 3,
    level: 1,
    gameOver: false,
    paused: false
  }
};

// 导出所有Mock数据
export default {
  users: mockUsers,
  games: mockGames,
  gameRooms: mockGameRooms,
  scores: mockScores,
  leaderboards: mockLeaderboards,
  social: mockSocial,
  notifications: mockNotifications,
  achievements: mockAchievements,
  settings: mockSettings,
  apiResponses: mockApiResponses,
  gameStates: mockGameStates
}; 
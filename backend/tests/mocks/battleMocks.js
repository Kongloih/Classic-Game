// Mock 游戏数据
const mockGames = [
  {
    id: 1,
    name: '俄罗斯方块',
    description: '经典的俄罗斯方块游戏',
    max_players: 4,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    name: '贪吃蛇',
    description: '控制蛇吃食物成长',
    max_players: 4,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    name: '打砖块',
    description: '用球拍反弹球击碎砖块',
    max_players: 4,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock 房间数据
const mockRooms = [
  {
    id: 1,
    room_id: 'room_1',
    game_id: 1,
    name: '俄罗斯方块房间1',
    status: '未满员',
    online_users: 45,
    max_user: 500,
    max_tables: 50,
    current_tables: 0,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    room_id: 'room_2',
    game_id: 1,
    name: '俄罗斯方块房间2',
    status: '满员',
    online_users: 500,
    max_user: 500,
    max_tables: 50,
    current_tables: 0,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    room_id: 'room_1',
    game_id: 2,
    name: '贪吃蛇房间1',
    status: '未满员',
    online_users: 23,
    max_user: 500,
    max_tables: 50,
    current_tables: 0,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock 桌子数据
const mockTables = [
  {
    id: 1,
    table_id: 'table_1',
    room_id: 1,
    seat_1_user_id: 1,
    seat_2_user_id: 2,
    seat_3_user_id: null,
    seat_4_user_id: null,
    status: 'waiting',
    current_players: 2,
    max_players: 4,
    game_start_time: null,
    game_end_time: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    table_id: 'table_2',
    room_id: 1,
    seat_1_user_id: 3,
    seat_2_user_id: 4,
    seat_3_user_id: 5,
    seat_4_user_id: 6,
    status: 'playing',
    current_players: 4,
    max_players: 4,
    game_start_time: new Date(),
    game_end_time: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    table_id: 'table_1',
    room_id: 3,
    seat_1_user_id: null,
    seat_2_user_id: null,
    seat_3_user_id: null,
    seat_4_user_id: null,
    status: 'empty',
    current_players: 0,
    max_players: 4,
    game_start_time: null,
    game_end_time: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock 用户数据
const mockUsers = [
  {
    id: 1,
    username: 'player1',
    avatar: 'avatar1.jpg',
    level: 10,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    username: 'player2',
    avatar: 'avatar2.jpg',
    level: 15,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    username: 'player3',
    avatar: 'avatar3.jpg',
    level: 8,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    username: 'player4',
    avatar: 'avatar4.jpg',
    level: 12,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock 用户状态数据
const mockUserStatus = [
  {
    id: 1,
    user_id: 1,
    room_id: 1,
    table_id: 1,
    seat_number: 1,
    status: 'waiting',
    last_activity: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    user_id: 2,
    room_id: 1,
    table_id: 1,
    seat_number: 2,
    status: 'waiting',
    last_activity: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 3,
    user_id: 3,
    room_id: 1,
    table_id: 2,
    seat_number: 1,
    status: 'playing',
    last_activity: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 4,
    user_id: 4,
    room_id: null,
    table_id: null,
    seat_number: null,
    status: 'idle',
    last_activity: new Date(Date.now() - 5 * 60 * 1000), // 5分钟前
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Mock 带关联数据的桌子
const mockTablesWithUsers = mockTables.map(table => ({
  ...table,
  seat1User: table.seat_1_user_id ? mockUsers.find(u => u.id === table.seat_1_user_id) : null,
  seat2User: table.seat_2_user_id ? mockUsers.find(u => u.id === table.seat_2_user_id) : null,
  seat3User: table.seat_3_user_id ? mockUsers.find(u => u.id === table.seat_3_user_id) : null,
  seat4User: table.seat_4_user_id ? mockUsers.find(u => u.id === table.seat_4_user_id) : null,
  seats: {
    1: table.seat_1_user_id ? mockUsers.find(u => u.id === table.seat_1_user_id) : null,
    2: table.seat_2_user_id ? mockUsers.find(u => u.id === table.seat_2_user_id) : null,
    3: table.seat_3_user_id ? mockUsers.find(u => u.id === table.seat_3_user_id) : null,
    4: table.seat_4_user_id ? mockUsers.find(u => u.id === table.seat_4_user_id) : null
  }
}));

module.exports = {
  mockGames,
  mockRooms,
  mockTables,
  mockUsers,
  mockUserStatus,
  mockTablesWithUsers
}; 
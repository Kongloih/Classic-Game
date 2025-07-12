// 离线API服务 - 当后端服务器未启动时使用
import { gameApi } from './api';

// 模拟游戏数据
const mockGames = {
  1: {
    id: 1,
    name: '俄罗斯方块',
    name_en: 'Tetris',
    category: 'puzzle',
    max_players: 4,
    supports_online: true
  },
  2: {
    id: 2,
    name: '贪吃蛇',
    name_en: 'Snake',
    category: 'arcade',
    max_players: 4,
    supports_online: true
  },
  3: {
    id: 3,
    name: '打砖块',
    name_en: 'Breakout',
    category: 'arcade',
    max_players: 4,
    supports_online: true
  },
  4: {
    id: 4,
    name: '拳皇97',
    name_en: 'King of Fighters 97',
    category: 'fighting',
    max_players: 2,
    supports_online: true
  },
  5: {
    id: 5,
    name: '街头霸王2',
    name_en: 'Street Fighter II',
    category: 'fighting',
    max_players: 2,
    supports_online: true
  }
};

// 模拟房间数据
const generateMockRooms = (gameId) => {
  const game = mockGames[gameId];
  if (!game) return [];
  
  return [
    {
      id: 1,
      room_id: 'room_1',
      name: `${game.name}房间1`,
      status: '未满员',
      online_users: Math.floor(Math.random() * 50),
      max_user: 500,
      current_tables: 50,
      max_tables: 50
    },
    {
      id: 2,
      room_id: 'room_2',
      name: `${game.name}房间2`,
      status: '未满员',
      online_users: Math.floor(Math.random() * 30),
      max_user: 500,
      current_tables: 50,
      max_tables: 50
    },
    {
      id: 3,
      room_id: 'room_3',
      name: `${game.name}房间3`,
      status: '未满员',
      online_users: Math.floor(Math.random() * 20),
      max_user: 500,
      current_tables: 50,
      max_tables: 50
    }
  ];
};

// 模拟桌子数据
const generateMockTables = (roomIds) => {
  const tables = [];
  let tableId = 1;
  
  roomIds.forEach(roomId => {
    for (let i = 1; i <= 50; i++) {
      const status = Math.random() > 0.7 ? 'waiting' : 'empty';
      const currentPlayers = status === 'waiting' ? Math.floor(Math.random() * 4) + 1 : 0;
      
      tables.push({
        id: tableId++,
        table_id: `table_${i}`,
        room_id: roomId,
        status,
        current_players: currentPlayers,
        max_players: 4,
        seats: {
          1: currentPlayers > 0 ? Math.random() > 0.5 ? 1 : null : null,
          2: currentPlayers > 1 ? Math.random() > 0.5 ? 2 : null : null,
          3: currentPlayers > 2 ? Math.random() > 0.5 ? 3 : null : null,
          4: currentPlayers > 3 ? Math.random() > 0.5 ? 4 : null : null,
        }
      });
    }
  });
  
  return tables;
};

// 离线API包装器
export const offlineGameApi = {
  // 获取游戏大厅数据
  getGameHall: async (gameId, testMode = false) => {
    try {
      // 首先尝试真实API
      return await gameApi.getGameHall(gameId, testMode);
    } catch (error) {
      console.log('API调用失败，使用离线数据:', error.message);
      
      // 如果API失败，返回模拟数据
      const game = mockGames[gameId];
      if (!game) {
        throw new Error('游戏不存在');
      }
      
      const rooms = generateMockRooms(gameId);
      const roomIds = rooms.map(room => room.id);
      const tables = generateMockTables(roomIds);
      
      return {
        success: true,
        data: {
          game,
          rooms,
          tables,
          userStatus: null
        }
      };
    }
  },
  
  // 获取在线用户列表
  getOnlineUsers: async (limit = 20) => {
    try {
      return await gameApi.getOnlineUsers(limit);
    } catch (error) {
      console.log('API调用失败，使用离线数据');
      
      // 返回模拟在线用户
      const mockUsers = [];
      for (let i = 1; i <= Math.min(limit, 10); i++) {
        mockUsers.push({
          id: i,
          username: `玩家${i}`,
          avatar: null,
          level: Math.floor(Math.random() * 50) + 1,
          last_login_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        });
      }
      
      return {
        success: true,
        data: mockUsers
      };
    }
  },
  
  // 获取用户游戏统计
  getUserStats: async (userId) => {
    try {
      return await gameApi.getUserStats(userId);
    } catch (error) {
      console.log('API调用失败，使用离线数据');
      
      return {
        success: true,
        data: {
          id: userId,
          username: `玩家${userId}`,
          avatar: null,
          level: Math.floor(Math.random() * 50) + 1,
          experience: Math.floor(Math.random() * 10000),
          coins: Math.floor(Math.random() * 10000),
          diamonds: Math.floor(Math.random() * 1000),
          total_games: Math.floor(Math.random() * 500),
          total_wins: Math.floor(Math.random() * 200),
          total_losses: Math.floor(Math.random() * 200),
          total_draws: Math.floor(Math.random() * 50),
          highest_score: Math.floor(Math.random() * 10000)
        }
      };
    }
  },
  
  // 获取游戏列表
  getGames: async (params) => {
    try {
      return await gameApi.getGames(params);
    } catch (error) {
      console.log('API调用失败，使用离线数据');
      
      return {
        success: true,
        data: Object.values(mockGames)
      };
    }
  },
  
  // 获取游戏详情
  getGame: async (gameId) => {
    try {
      return await gameApi.getGame(gameId);
    } catch (error) {
      console.log('API调用失败，使用离线数据');
      
      const game = mockGames[gameId];
      if (!game) {
        throw new Error('游戏不存在');
      }
      
      return {
        success: true,
        data: game
      };
    }
  }
};

export default offlineGameApi; 
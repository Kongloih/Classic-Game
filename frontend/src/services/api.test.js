// Mock axios before importing
const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => mockAxios),
  defaults: {
    headers: { common: {} }
  },
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

// Mock axios module
jest.mock('axios', () => mockAxios);

// Import after mocking - use require for synchronous import
const { gameApi, authApi } = require('./api');

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true
    });
  });

  describe('gameApi', () => {
    describe('getGameHall', () => {
      it('should fetch game hall data successfully', async () => {
        const mockResponse = {
          success: true,
          data: {
            game: { id: 1, name: '俄罗斯方块' },
            gameTables: [],
            stats: { onlineUsers: 10, activeRooms: 5 }
          }
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await gameApi.getGameHall(1);

        expect(mockAxios.get).toHaveBeenCalledWith('/games/hall/1');
        expect(result).toEqual(mockResponse);
      });

      it('should handle errors', async () => {
        const errorMessage = 'Network Error';
        mockAxios.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(gameApi.getGameHall(1)).rejects.toThrow(errorMessage);
      });
    });

    describe('getOnlineUsers', () => {
      it('should fetch online users successfully', async () => {
        const mockResponse = {
          success: true,
          data: [
            { id: 1, username: 'user1' },
            { id: 2, username: 'user2' }
          ]
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await gameApi.getOnlineUsers(10);

        expect(mockAxios.get).toHaveBeenCalledWith('/games/online-users', {
          params: { limit: 10 }
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getUserStats', () => {
      it('should fetch user stats successfully', async () => {
        const mockResponse = {
          success: true,
          data: {
            id: 1,
            username: 'testuser',
            level: 5,
            experience: 1000
          }
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await gameApi.getUserStats(1);

        expect(mockAxios.get).toHaveBeenCalledWith('/games/stats/1');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getGames', () => {
      it('should fetch games list successfully', async () => {
        const mockResponse = {
          success: true,
          data: [
            { id: 1, name: '俄罗斯方块' },
            { id: 2, name: '贪吃蛇' }
          ]
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await gameApi.getGames({ category: 'puzzle' });

        expect(mockAxios.get).toHaveBeenCalledWith('/games', {
          params: { category: 'puzzle' }
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getGame', () => {
      it('should fetch single game successfully', async () => {
        const mockResponse = {
          success: true,
          data: { id: 1, name: '俄罗斯方块', category: 'puzzle' }
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await gameApi.getGame(1);

        expect(mockAxios.get).toHaveBeenCalledWith('/games/1');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('authApi', () => {
    describe('register', () => {
      it('should register user successfully', async () => {
        const userData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          phone: '13800138000'
        };

        const mockResponse = {
          success: true,
          message: '注册成功！',
          data: {
            user: { id: 1, username: 'testuser' },
            token: 'mock-token'
          }
        };

        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authApi.register(userData);

        expect(mockAxios.post).toHaveBeenCalledWith('/auth/register', userData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('login', () => {
      it('should login user successfully', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const mockResponse = {
          success: true,
          message: '登录成功',
          data: {
            user: { id: 1, username: 'testuser' },
            token: 'mock-token'
          }
        };

        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authApi.login(loginData);

        expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', loginData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('sendSms', () => {
      it('should send SMS successfully', async () => {
        const smsData = {
          phone: '13800138000',
          type: 'register'
        };

        const mockResponse = {
          success: true,
          message: '验证码已发送'
        };

        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authApi.sendSms(smsData);

        expect(mockAxios.post).toHaveBeenCalledWith('/auth/send-sms', smsData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getAuthStatus', () => {
      it('should get auth status successfully', async () => {
        const mockResponse = {
          success: true,
          data: {
            isAuthenticated: true,
            user: { id: 1, username: 'testuser' }
          }
        };

        mockAxios.get.mockResolvedValueOnce(mockResponse);

        const result = await authApi.getAuthStatus();

        expect(mockAxios.get).toHaveBeenCalledWith('/auth/status');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('logout', () => {
      it('should logout successfully', async () => {
        const mockResponse = {
          success: true,
          message: '登出成功'
        };

        mockAxios.post.mockResolvedValueOnce(mockResponse);

        const result = await authApi.logout();

        expect(mockAxios.post).toHaveBeenCalledWith('/auth/logout');
        expect(result).toEqual(mockResponse);
      });
    });
  });
}); 
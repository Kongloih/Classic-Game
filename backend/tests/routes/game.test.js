const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Game = require('../../src/models/Game');
const { sequelize } = require('../../src/config/database');

describe('Game Routes', () => {
  let token;
  let user;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await User.destroy({ where: {} });
    await Game.destroy({ where: {} });

    // 创建测试用户
    user = await User.create({
      username: 'testuser123',
      phone: '+8613800138000',
      email: 'test@example.com',
      password: 'Password123',
      nickname: 'Test User'
    });

    // 创建测试游戏
    await Game.create({
      name: '俄罗斯方块',
      name_en: 'Tetris',
      category: 'puzzle',
      developer: 'Nintendo',
      publisher: 'Nintendo',
      release_year: 1984,
      description: '经典益智游戏',
      max_players: 2,
      supports_online: true,
      status: 'active'
    });

    // 获取认证token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: 'test@example.com',
        password: 'Password123'
      });

    token = loginResponse.body.data.token;
  });

  describe('GET /api/games/hall/:gameId', () => {
    it('should get game hall data successfully', async () => {
      const response = await request(app)
        .get('/api/games/hall/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.game).toBeDefined();
      expect(response.body.data.gameTables).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.onlineUsers).toBeDefined();
      expect(response.body.data.stats.activeRooms).toBeDefined();
      expect(response.body.data.stats.maxScore).toBeDefined();
    });

    it('should return 404 for non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/hall/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('游戏不存在');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/games/hall/1')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('缺少访问令牌');
    });
  });

  describe('GET /api/games/online-users', () => {
    beforeEach(async () => {
      // 创建更多在线用户
      await User.bulkCreate([
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'password123',
          phone: '1111111111',
          nickname: 'User 1',
          lastLoginAt: new Date()
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'password123',
          phone: '2222222222',
          nickname: 'User 2',
          lastLoginAt: new Date()
        },
        {
          username: 'user3',
          email: 'user3@example.com',
          password: 'password123',
          phone: '3333333333',
          nickname: 'User 3',
          lastLoginAt: new Date(Date.now() - 20 * 60 * 1000) // 20分钟前登录
        }
      ]);
    });

    it('should get online users list', async () => {
      const response = await request(app)
        .get('/api/games/online-users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/games/online-users?limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/games/online-users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/games/stats/:userId', () => {
    it('should get user game stats', async () => {
      const response = await request(app)
        .get(`/api/games/stats/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.username).toBe(user.username);
      expect(response.body.data.level).toBeDefined();
      expect(response.body.data.experience).toBeDefined();
      expect(response.body.data.coins).toBeDefined();
      expect(response.body.data.diamonds).toBeDefined();
      expect(response.body.data.total_games).toBeDefined();
      expect(response.body.data.total_wins).toBeDefined();
      expect(response.body.data.total_losses).toBeDefined();
      expect(response.body.data.total_draws).toBeDefined();
      expect(response.body.data.highest_score).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/games/stats/999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户不存在');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/games/stats/${user.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/games', () => {
    beforeEach(async () => {
      // 创建更多测试游戏
      await Game.bulkCreate([
        {
          name: '贪吃蛇',
          name_en: 'Snake',
          category: 'arcade',
          developer: 'Gremlin',
          publisher: 'Gremlin',
          release_year: 1976,
          description: '经典街机游戏',
          max_players: 1,
          supports_online: false,
          status: 'active',
          is_featured: true
        },
        {
          name: '打砖块',
          name_en: 'Breakout',
          category: 'action',
          developer: 'Atari',
          publisher: 'Atari',
          release_year: 1976,
          description: '经典动作游戏',
          max_players: 1,
          supports_online: false,
          status: 'active',
          is_hot: true
        }
      ]);
    });

    it('should get games list', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter games by category', async () => {
      const response = await request(app)
        .get('/api/games?category=puzzle')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.every(game => game.category === 'puzzle')).toBe(true);
    });

    it('should filter featured games', async () => {
      const response = await request(app)
        .get('/api/games?featured=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.every(game => game.is_featured === true)).toBe(true);
    });

    it('should filter hot games', async () => {
      const response = await request(app)
        .get('/api/games?hot=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.every(game => game.is_hot === true)).toBe(true);
    });

    it('should limit results', async () => {
      const response = await request(app)
        .get('/api/games?limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/games/:id', () => {
    it('should get game details', async () => {
      const game = await Game.findOne({ where: { name: '俄罗斯方块' } });

      const response = await request(app)
        .get(`/api/games/${game.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(game.id);
      expect(response.body.data.name).toBe(game.name);
      expect(response.body.data.category).toBe(game.category);
    });

    it('should return 404 for non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('游戏不存在');
    });
  });
}); 
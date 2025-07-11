const User = require('../../src/models/User');
const { sequelize } = require('../../src/config/database');

describe('User Model', () => {
  beforeAll(async () => {
    // 确保数据库已同步
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // 清理数据库
    await User.destroy({ where: {} });
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        phone: '13800138000',
        nickname: 'Test User'
      };

      const user = await User.create(userData);
      
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.nickname).toBe(userData.nickname);
      expect(user.phone).toBe(userData.phone);
      expect(user.level).toBe(1);
      expect(user.coins).toBe(1000);
    });

    it('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        phone: '13800138000',
        nickname: 'Test User'
      };

      const user = await User.create(userData);
      
      expect(user.password).not.toBe('Password123');
      expect(user.password).toBeDefined();
    });

    it('should not allow duplicate username', async () => {
      const userData1 = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'Password123',
        phone: '13800138001',
        nickname: 'Test User 1'
      };

      const userData2 = {
        username: 'testuser', // 重复用户名
        email: 'test2@example.com',
        password: 'Password123',
        phone: '13800138002',
        nickname: 'Test User 2'
      };

      await User.create(userData1);
      
      await expect(User.create(userData2)).rejects.toThrow();
    });

    it('should not allow duplicate email', async () => {
      const userData1 = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'Password123',
        phone: '13800138001',
        nickname: 'Test User 1'
      };

      const userData2 = {
        username: 'testuser2',
        email: 'test@example.com', // 重复邮箱
        password: 'Password123',
        phone: '13800138002',
        nickname: 'Test User 2'
      };

      await User.create(userData1);
      
      await expect(User.create(userData2)).rejects.toThrow();
    });
  });

  describe('User Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        phone: '13800138000',
        nickname: 'Test User'
      });
    });

    it('should check password correctly', async () => {
      const isValid = await user.checkPassword('Password123');
      expect(isValid).toBe(true);

      const isInvalid = await user.checkPassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });

    it('should calculate win rate correctly', () => {
      user.total_games = 10;
      user.total_wins = 7;
      
      const winRate = user.getWinRate();
      expect(winRate).toBe(70);
    });

    it('should return 0 win rate for no games', () => {
      user.total_games = 0;
      user.total_wins = 0;
      
      const winRate = user.getWinRate();
      expect(winRate).toBe(0);
    });

    it('should add experience and level up', async () => {
      // 使用已有的user，避免重复创建
      user.level = 1;
      user.experience = 50;
      user.coins = 1000;
      await user.save();

      await user.addExperience(100);
      await user.reload();

      expect(user.level).toBe(2);
      expect(user.experience).toBe(50); // 100 + 50 - 100 = 50
      expect(user.coins).toBe(1100); // 1000 + 100 (升级奖励)
    });

    it('should update game stats correctly', async () => {
      const initialGames = user.total_games;
      const initialWins = user.total_wins;
      const initialCoins = user.coins;

      await user.updateGameStats('win', 500);
      await user.reload();

      expect(user.total_games).toBe(initialGames + 1);
      expect(user.total_wins).toBe(initialWins + 1);
      expect(user.highest_score).toBe(500);
      expect(user.coins).toBeGreaterThan(initialCoins);
    });

    it('should handle daily checkin correctly', async () => {
      const result = await user.dailyCheckin();

      expect(result.success).toBe(true);
      expect(result.reward).toBeGreaterThan(0);
      expect(result.consecutive_days).toBe(1);
      expect(user.consecutive_checkin_days).toBe(1);
      expect(user.total_checkin_days).toBe(1);
    });

    it('should not allow duplicate checkin on same day', async () => {
      await user.dailyCheckin();
      const result = await user.dailyCheckin();

      expect(result.success).toBe(false);
      expect(result.message).toContain('今天已经签到');
    });
  });

  describe('User Class Methods', () => {
    beforeEach(async () => {
      await User.bulkCreate([
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'Password123',
          phone: '1111111111',
          nickname: 'User 1',
          level: 5,
          total_wins: 10,
          highest_score: 1000
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'Password123',
          phone: '2222222222',
          nickname: 'User 2',
          level: 3,
          total_wins: 5,
          highest_score: 800
        },
        {
          username: 'user3',
          email: 'user3@example.com',
          password: 'Password123',
          phone: '3333333333',
          nickname: 'User 3',
          level: 7,
          total_wins: 15,
          highest_score: 1200
        }
      ]);
    });

    it('should find user by email or username', async () => {
      const userByEmail = await User.findByEmailOrUsername('user1@example.com');
      expect(userByEmail).toBeDefined();
      expect(userByEmail.username).toBe('user1');

      const userByUsername = await User.findByEmailOrUsername('user2');
      expect(userByUsername).toBeDefined();
      expect(userByUsername.email).toBe('user2@example.com');
    });

    it('should get leaderboard by level', async () => {
      const leaderboard = await User.getLeaderboard('level', 3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].level).toBe(7); // User 3 has level 7
      expect(leaderboard[1].level).toBe(5); // User 1 has level 5
      expect(leaderboard[2].level).toBe(3); // User 2 has level 3
    });

    it('should get leaderboard by wins', async () => {
      const leaderboard = await User.getLeaderboard('wins', 3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].total_wins).toBe(15); // User 3 has 15 wins
      expect(leaderboard[1].total_wins).toBe(10); // User 1 has 10 wins
      expect(leaderboard[2].total_wins).toBe(5);  // User 2 has 5 wins
    });

    it('should get leaderboard by score', async () => {
      const leaderboard = await User.getLeaderboard('score', 3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].highest_score).toBe(1200); // User 3 has highest_score 1200
      expect(leaderboard[1].highest_score).toBe(1000); // User 1 has highest_score 1000
      expect(leaderboard[2].highest_score).toBe(800);  // User 2 has highest_score 800
    });

    it('should find active users', async () => {
      const activeUsers = await User.findActiveUsers(2);

      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(user => user.status === 'active')).toBe(true);
    });
  });
}); 
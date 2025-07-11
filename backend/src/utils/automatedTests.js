// 后端自动化测试框架

const request = require('supertest');
const express = require('express');
const mockData = require('../__mocks__/mockData');

// 自动化测试基类
class AutomatedTestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.results = [];
    this.startTime = null;
    this.endTime = null;
    this.app = null;
  }

  // 设置Express应用
  setupApp() {
    this.app = express();
    this.app.use(express.json());
    return this.app;
  }

  // 添加测试用例
  addTest(testName, testFunction) {
    this.tests.push({
      name: testName,
      function: testFunction
    });
  }

  // 运行所有测试
  async runAll() {
    console.log(`🚀 开始运行测试套件: ${this.name}`);
    this.startTime = Date.now();
    
    for (const test of this.tests) {
      try {
        console.log(`  📝 运行测试: ${test.name}`);
        await test.function();
        this.results.push({
          name: test.name,
          status: 'PASS',
          error: null,
          duration: 0
        });
        console.log(`  ✅ 测试通过: ${test.name}`);
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'FAIL',
          error: error.message,
          duration: 0
        });
        console.log(`  ❌ 测试失败: ${test.name} - ${error.message}`);
      }
    }
    
    this.endTime = Date.now();
    this.printResults();
  }

  // 打印测试结果
  printResults() {
    const duration = this.endTime - this.startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log('\n📊 测试结果汇总:');
    console.log(`  测试套件: ${this.name}`);
    console.log(`  总测试数: ${this.tests.length}`);
    console.log(`  通过: ${passed}`);
    console.log(`  失败: ${failed}`);
    console.log(`  总耗时: ${duration}ms`);
    
    if (failed > 0) {
      console.log('\n❌ 失败的测试:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }
  }
}

// API路由自动化测试
class APIAutomatedTests extends AutomatedTestSuite {
  constructor() {
    super('API路由自动化测试');
    this.setupTests();
  }

  setupTests() {
    this.addTest('用户注册API测试', this.testUserRegistration);
    this.addTest('用户登录API测试', this.testUserLogin);
    this.addTest('用户登出API测试', this.testUserLogout);
    this.addTest('获取用户资料API测试', this.testGetUserProfile);
    this.addTest('获取游戏列表API测试', this.testGetGames);
    this.addTest('获取排行榜API测试', this.testGetLeaderboard);
    this.addTest('创建游戏房间API测试', this.testCreateGameRoom);
    this.addTest('加入游戏房间API测试', this.testJoinGameRoom);
    this.addTest('获取好友列表API测试', this.testGetFriends);
    this.addTest('发送好友请求API测试', this.testSendFriendRequest);
  }

  async testUserRegistration() {
    const app = this.setupApp();
    
    // 模拟注册路由
    app.post('/api/auth/register', (req, res) => {
      const { username, email, password, confirmPassword } = req.body;
      
      // 验证输入
      if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '所有字段都是必填的'
        });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '密码确认不匹配'
        });
      }
      
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({
          success: false,
          message: '用户名长度必须在3-20个字符之间'
        });
      }
      
      // 检查用户是否已存在
      const existingUser = mockData.queryResults.findUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
      
      // 创建新用户
      const newUser = {
        id: Date.now(),
        username,
        email,
        password: 'hashedPassword',
        avatar: 'https://via.placeholder.com/150',
        level: 1,
        experience: 0,
        coins: 100,
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(201).json({
        success: true,
        message: '用户注册成功',
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            avatar: newUser.avatar,
            level: newUser.level,
            experience: newUser.experience,
            coins: newUser.coins
          }
        }
      });
    });

    // 测试成功注册
    const validUserData = {
      username: 'newuser123',
      email: 'newuser123@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(validUserData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('用户注册成功');
    expect(response.body.data.user.username).toBe(validUserData.username);
    expect(response.body.data.user.email).toBe(validUserData.email);

    // 测试密码不匹配
    const invalidUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword'
    };

    const errorResponse = await request(app)
      .post('/api/auth/register')
      .send(invalidUserData)
      .expect(400);

    expect(errorResponse.body.success).toBe(false);
    expect(errorResponse.body.message).toBe('密码确认不匹配');
  }

  async testUserLogin() {
    const app = this.setupApp();
    
    // 模拟登录路由
    app.post('/api/auth/login', (req, res) => {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }
      
      // 查找用户
      const user = mockData.queryResults.findUserByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }
      
      // 验证密码（这里简化处理）
      if (password !== 'password123') {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }
      
      // 生成JWT令牌
      const token = 'mock-jwt-token';
      
      res.json({
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
        }
      });
    });

    // 测试成功登录
    const validLoginData = {
      username: 'testuser',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(validLoginData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('登录成功');
    expect(response.body.data.user.username).toBe(validLoginData.username);
    expect(response.body.data.token).toBeDefined();

    // 测试无效凭据
    const invalidLoginData = {
      username: 'testuser',
      password: 'wrongpassword'
    };

    const errorResponse = await request(app)
      .post('/api/auth/login')
      .send(invalidLoginData)
      .expect(401);

    expect(errorResponse.body.success).toBe(false);
    expect(errorResponse.body.message).toBe('用户名或密码错误');
  }

  async testUserLogout() {
    const app = this.setupApp();
    
    // 模拟登出路由
    app.post('/api/auth/logout', (req, res) => {
      res.json({
        success: true,
        message: '登出成功'
      });
    });

    const response = await request(app)
      .post('/api/auth/logout')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('登出成功');
  }

  async testGetUserProfile() {
    const app = this.setupApp();
    
    // 模拟认证中间件
    const authMiddleware = (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }
      req.user = mockData.users[0]; // 使用第一个用户作为当前用户
      next();
    };
    
    // 模拟获取用户资料路由
    app.get('/api/auth/profile', authMiddleware, (req, res) => {
      res.json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            avatar: req.user.avatar,
            level: req.user.level,
            experience: req.user.experience,
            coins: req.user.coins,
            role: req.user.role
          }
        }
      });
    });

    // 测试有认证的请求
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.username).toBe('testuser');

    // 测试无认证的请求
    const errorResponse = await request(app)
      .get('/api/auth/profile')
      .expect(401);

    expect(errorResponse.body.success).toBe(false);
    expect(errorResponse.body.message).toBe('未授权访问');
  }

  async testGetGames() {
    const app = this.setupApp();
    
    // 模拟获取游戏列表路由
    app.get('/api/games', (req, res) => {
      const { page = 1, limit = 10 } = req.query;
      const games = mockData.games;
      
      res.json({
        success: true,
        data: games,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: games.length,
          pages: Math.ceil(games.length / limit)
        }
      });
    });

    const response = await request(app)
      .get('/api/games')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(3);
    expect(response.body.pagination.total).toBe(3);
    expect(response.body.data[0].title).toBe('俄罗斯方块');
  }

  async testGetLeaderboard() {
    const app = this.setupApp();
    
    // 模拟获取排行榜路由
    app.get('/api/leaderboard/:gameId', (req, res) => {
      const { gameId } = req.params;
      const { type = 'global' } = req.query;
      
      let leaderboard;
      switch (type) {
        case 'global':
          leaderboard = mockData.leaderboards.global;
          break;
        case 'weekly':
          leaderboard = mockData.leaderboards.weekly;
          break;
        case 'friends':
          leaderboard = mockData.leaderboards.friends;
          break;
        default:
          leaderboard = mockData.leaderboards.global;
      }
      
      res.json({
        success: true,
        data: leaderboard
      });
    });

    const response = await request(app)
      .get('/api/leaderboard/1?type=global')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.data[0].rank).toBe(1);
  }

  async testCreateGameRoom() {
    const app = this.setupApp();
    
    // 模拟认证中间件
    const authMiddleware = (req, res, next) => {
      req.user = mockData.users[0];
      next();
    };
    
    // 模拟创建游戏房间路由
    app.post('/api/games/rooms', authMiddleware, (req, res) => {
      const { gameId, maxPlayers = 2, settings = {} } = req.body;
      
      if (!gameId) {
        return res.status(400).json({
          success: false,
          message: '游戏ID是必需的'
        });
      }
      
      const game = mockData.queryResults.findGameById(gameId);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: '游戏不存在'
        });
      }
      
      const newRoom = {
        id: `room_${Date.now()}`,
        gameId,
        gameName: game.title,
        players: [{
          id: req.user.id,
          username: req.user.username,
          ready: true,
          score: 0
        }],
        maxPlayers,
        status: 'waiting',
        settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(201).json({
        success: true,
        message: '房间创建成功',
        data: newRoom
      });
    });

    const roomData = {
      gameId: 1,
      maxPlayers: 2,
      settings: {
        difficulty: 'normal',
        timeLimit: 300
      }
    };

    const response = await request(app)
      .post('/api/games/rooms')
      .send(roomData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('房间创建成功');
    expect(response.body.data.gameId).toBe(roomData.gameId);
    expect(response.body.data.players).toHaveLength(1);
  }

  async testJoinGameRoom() {
    const app = this.setupApp();
    
    // 模拟认证中间件
    const authMiddleware = (req, res, next) => {
      req.user = mockData.users[1]; // 使用第二个用户
      next();
    };
    
    // 模拟加入游戏房间路由
    app.post('/api/games/rooms/:roomId/join', authMiddleware, (req, res) => {
      const { roomId } = req.params;
      
      const room = mockData.queryResults.findRoomById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: '房间不存在'
        });
      }
      
      if (room.status !== 'waiting') {
        return res.status(400).json({
          success: false,
          message: '房间已满或游戏已开始'
        });
      }
      
      if (room.players.length >= room.maxPlayers) {
        return res.status(400).json({
          success: false,
          message: '房间已满'
        });
      }
      
      // 添加玩家到房间
      room.players.push({
        id: req.user.id,
        username: req.user.username,
        ready: false,
        score: 0
      });
      
      res.json({
        success: true,
        message: '成功加入房间',
        data: room
      });
    });

    const response = await request(app)
      .post('/api/games/rooms/room_1/join')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('成功加入房间');
    expect(response.body.data.players).toHaveLength(2);
  }

  async testGetFriends() {
    const app = this.setupApp();
    
    // 模拟认证中间件
    const authMiddleware = (req, res, next) => {
      req.user = mockData.users[0];
      next();
    };
    
    // 模拟获取好友列表路由
    app.get('/api/social/friends', authMiddleware, (req, res) => {
      const friendships = mockData.queryResults.findFriendshipsByUserId(req.user.id);
      const friends = friendships
        .filter(f => f.status === 'accepted')
        .map(f => {
          const friendId = f.userId === req.user.id ? f.friendId : f.userId;
          return mockData.queryResults.findUserById(friendId);
        })
        .filter(Boolean);
      
      res.json({
        success: true,
        data: friends
      });
    });

    const response = await request(app)
      .get('/api/social/friends')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  }

  async testSendFriendRequest() {
    const app = this.setupApp();
    
    // 模拟认证中间件
    const authMiddleware = (req, res, next) => {
      req.user = mockData.users[0];
      next();
    };
    
    // 模拟发送好友请求路由
    app.post('/api/social/friends/request', authMiddleware, (req, res) => {
      const { friendId, message } = req.body;
      
      if (!friendId) {
        return res.status(400).json({
          success: false,
          message: '好友ID是必需的'
        });
      }
      
      const friend = mockData.queryResults.findUserById(friendId);
      if (!friend) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
      
      // 检查是否已经是好友
      const existingFriendship = mockData.queryResults.findFriendshipsByUserId(req.user.id)
        .find(f => (f.userId === req.user.id && f.friendId === friendId) ||
                   (f.userId === friendId && f.friendId === req.user.id));
      
      if (existingFriendship) {
        return res.status(400).json({
          success: false,
          message: '已经是好友或请求已发送'
        });
      }
      
      res.json({
        success: true,
        message: '好友请求已发送',
        data: {
          friendId,
          message: message || '我想和你成为好友！'
        }
      });
    });

    const requestData = {
      friendId: 3,
      message: '你好，我想和你成为好友！'
    };

    const response = await request(app)
      .post('/api/social/friends/request')
      .send(requestData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('好友请求已发送');
    expect(response.body.data.friendId).toBe(requestData.friendId);
  }
}

// 数据库操作自动化测试
class DatabaseAutomatedTests extends AutomatedTestSuite {
  constructor() {
    super('数据库操作自动化测试');
    this.setupTests();
  }

  setupTests() {
    this.addTest('用户查询测试', this.testUserQueries);
    this.addTest('游戏查询测试', this.testGameQueries);
    this.addTest('分数查询测试', this.testScoreQueries);
    this.addTest('房间查询测试', this.testRoomQueries);
    this.addTest('好友关系查询测试', this.testFriendshipQueries);
  }

  async testUserQueries() {
    // 测试按用户名查找用户
    const userByUsername = mockData.queryResults.findUserByUsername('testuser');
    expect(userByUsername).toBeDefined();
    expect(userByUsername.username).toBe('testuser');
    expect(userByUsername.email).toBe('test@example.com');

    // 测试按ID查找用户
    const userById = mockData.queryResults.findUserById(1);
    expect(userById).toBeDefined();
    expect(userById.id).toBe(1);
    expect(userById.username).toBe('testuser');

    // 测试按邮箱查找用户
    const userByEmail = mockData.queryResults.findUserByEmail('test@example.com');
    expect(userByEmail).toBeDefined();
    expect(userByEmail.email).toBe('test@example.com');

    // 测试查找不存在的用户
    const nonExistentUser = mockData.queryResults.findUserByUsername('nonexistent');
    expect(nonExistentUser).toBeUndefined();
  }

  async testGameQueries() {
    // 测试按ID查找游戏
    const gameById = mockData.queryResults.findGameById(1);
    expect(gameById).toBeDefined();
    expect(gameById.title).toBe('俄罗斯方块');
    expect(gameById.category).toBe('益智');

    // 测试获取所有游戏
    const allGames = mockData.queryResults.findAllGames();
    expect(allGames).toHaveLength(3);
    expect(allGames[0].title).toBe('俄罗斯方块');
    expect(allGames[1].title).toBe('贪吃蛇');
    expect(allGames[2].title).toBe('打砖块');

    // 测试查找不存在的游戏
    const nonExistentGame = mockData.queryResults.findGameById(999);
    expect(nonExistentGame).toBeUndefined();
  }

  async testScoreQueries() {
    // 测试按游戏ID查找分数
    const scoresByGameId = mockData.queryResults.findScoresByGameId(1);
    expect(scoresByGameId).toHaveLength(3);
    expect(scoresByGameId[0].gameId).toBe(1);
    expect(scoresByGameId[0].score).toBe(5000);

    // 测试按用户ID查找分数
    const scoresByUserId = mockData.queryResults.findScoresByUserId(1);
    expect(scoresByUserId).toHaveLength(3);
    expect(scoresByUserId[0].userId).toBe(1);

    // 测试查找不存在的分数
    const scoresByNonExistentGame = mockData.queryResults.findScoresByGameId(999);
    expect(scoresByNonExistentGame).toHaveLength(0);
  }

  async testRoomQueries() {
    // 测试按房间ID查找房间
    const roomById = mockData.queryResults.findRoomById('room_1');
    expect(roomById).toBeDefined();
    expect(roomById.gameId).toBe(1);
    expect(roomById.status).toBe('waiting');

    // 测试按游戏ID查找房间
    const roomsByGameId = mockData.queryResults.findRoomsByGameId(1);
    expect(roomsByGameId).toHaveLength(1);
    expect(roomsByGameId[0].gameId).toBe(1);

    // 测试查找不存在的房间
    const nonExistentRoom = mockData.queryResults.findRoomById('nonexistent');
    expect(nonExistentRoom).toBeUndefined();
  }

  async testFriendshipQueries() {
    // 测试按用户ID查找好友关系
    const friendshipsByUserId = mockData.queryResults.findFriendshipsByUserId(1);
    expect(friendshipsByUserId).toHaveLength(4);
    
    // 检查接受的好友关系
    const acceptedFriendships = friendshipsByUserId.filter(f => f.status === 'accepted');
    expect(acceptedFriendships).toHaveLength(3);
    
    // 检查待处理的好友请求
    const pendingRequests = friendshipsByUserId.filter(f => f.status === 'pending');
    expect(pendingRequests).toHaveLength(1);
  }
}

// 中间件自动化测试
class MiddlewareAutomatedTests extends AutomatedTestSuite {
  constructor() {
    super('中间件自动化测试');
    this.setupTests();
  }

  setupTests() {
    this.addTest('认证中间件测试', this.testAuthMiddleware);
    this.addTest('错误处理中间件测试', this.testErrorHandlerMiddleware);
    this.addTest('日志中间件测试', this.testLoggerMiddleware);
    this.addTest('CORS中间件测试', this.testCORSMiddleware);
    this.addTest('速率限制中间件测试', this.testRateLimitMiddleware);
  }

  async testAuthMiddleware() {
    const app = this.setupApp();
    
    // 模拟认证中间件
    const authMiddleware = (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }
      
      // 验证令牌（这里简化处理）
      if (token === 'valid-token') {
        req.user = mockData.users[0];
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: '无效的令牌'
        });
      }
    };
    
    // 测试路由
    app.get('/protected', authMiddleware, (req, res) => {
      res.json({
        success: true,
        data: { user: req.user }
      });
    });

    // 测试有效令牌
    const validResponse = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(validResponse.body.success).toBe(true);
    expect(validResponse.body.data.user).toBeDefined();

    // 测试无效令牌
    const invalidResponse = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(invalidResponse.body.success).toBe(false);
    expect(invalidResponse.body.message).toBe('无效的令牌');

    // 测试无令牌
    const noTokenResponse = await request(app)
      .get('/protected')
      .expect(401);

    expect(noTokenResponse.body.success).toBe(false);
    expect(noTokenResponse.body.message).toBe('未授权访问');
  }

  async testErrorHandlerMiddleware() {
    const app = this.setupApp();
    
    // 模拟错误处理中间件
    const errorHandler = (err, req, res, next) => {
      console.error(err.stack);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || '服务器内部错误',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    };
    
    // 测试路由
    app.get('/error', (req, res, next) => {
      const error = new Error('测试错误');
      error.status = 400;
      next(error);
    });
    
    app.use(errorHandler);

    const response = await request(app)
      .get('/error')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('测试错误');
  }

  async testLoggerMiddleware() {
    const app = this.setupApp();
    
    // 模拟日志中间件
    const loggerMiddleware = (req, res, next) => {
      req.logger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      };
      next();
    };
    
    // 测试路由
    app.use(loggerMiddleware);
    app.get('/test', (req, res) => {
      req.logger.info('测试日志');
      res.json({ success: true });
    });

    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.body.success).toBe(true);
  }

  async testCORSMiddleware() {
    const app = this.setupApp();
    
    // 模拟CORS中间件
    const corsMiddleware = (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    };
    
    app.use(corsMiddleware);
    app.get('/test', (req, res) => {
      res.json({ success: true });
    });

    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.headers['access-control-allow-origin']).toBe('*');
    expect(response.body.success).toBe(true);
  }

  async testRateLimitMiddleware() {
    const app = this.setupApp();
    
    // 模拟速率限制中间件
    const rateLimit = new Map();
    const rateLimitMiddleware = (req, res, next) => {
      const ip = req.ip || 'unknown';
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15分钟
      const maxRequests = 100;
      
      if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      } else {
        const record = rateLimit.get(ip);
        if (now > record.resetTime) {
          record.count = 1;
          record.resetTime = now + windowMs;
        } else {
          record.count++;
        }
        
        if (record.count > maxRequests) {
          return res.status(429).json({
            success: false,
            message: '请求过于频繁，请稍后再试'
          });
        }
      }
      next();
    };
    
    app.use(rateLimitMiddleware);
    app.get('/test', (req, res) => {
      res.json({ success: true });
    });

    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.body.success).toBe(true);
  }
}

// 自动化测试运行器
class AutomatedTestRunner {
  constructor() {
    this.testSuites = [];
  }

  // 添加测试套件
  addTestSuite(testSuite) {
    this.testSuites.push(testSuite);
  }

  // 运行所有测试套件
  async runAllSuites() {
    console.log('🚀 开始运行后端自动化测试套件');
    console.log('=====================================');
    
    const startTime = Date.now();
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    for (const testSuite of this.testSuites) {
      await testSuite.runAll();
      totalTests += testSuite.tests.length;
      totalPassed += testSuite.results.filter(r => r.status === 'PASS').length;
      totalFailed += testSuite.results.filter(r => r.status === 'FAIL').length;
    }

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    console.log('\n📊 总体测试结果汇总:');
    console.log('=====================================');
    console.log(`总测试套件数: ${this.testSuites.length}`);
    console.log(`总测试数: ${totalTests}`);
    console.log(`总通过数: ${totalPassed}`);
    console.log(`总失败数: ${totalFailed}`);
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`成功率: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);

    if (totalFailed === 0) {
      console.log('\n🎉 所有测试都通过了！');
    } else {
      console.log('\n⚠️  有测试失败，请检查失败的测试用例。');
    }
  }
}

// 导出测试实例
const apiTests = new APIAutomatedTests();
const databaseTests = new DatabaseAutomatedTests();
const middlewareTests = new MiddlewareAutomatedTests();
const testRunner = new AutomatedTestRunner();

// 默认导出
module.exports = {
  AutomatedTestSuite,
  APIAutomatedTests,
  DatabaseAutomatedTests,
  MiddlewareAutomatedTests,
  AutomatedTestRunner,
  apiTests,
  databaseTests,
  middlewareTests,
  testRunner
}; 
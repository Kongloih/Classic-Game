const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/config/database');
const User = require('../../src/models/User');

describe('Auth Routes', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      username: 'testuser123',
      phone: '+8613800138000',
      email: 'test@example.com',
      password: 'Password123',
      verificationCode: '123456',
      gender: 'male',
      birthYear: 1990
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('注册成功！');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for duplicate username', async () => {
      // 先创建一个用户
      await User.create({
        username: 'testuser123',
        phone: '+8613800138001',
        email: 'test1@example.com',
        password: 'Password123',
        nickname: 'Test User'
      });

      const duplicateUserData = {
        ...validUserData,
        email: 'test2@example.com',
        phone: '+8613800138002'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('已被使用');
    });

    it('should return error for duplicate email', async () => {
      // 先创建一个用户
      await User.create({
        username: 'testuser456',
        phone: '+8613800138003',
        email: 'test@example.com',
        password: 'Password123',
        nickname: 'Test User'
      });

      const duplicateEmailData = {
        ...validUserData,
        username: 'testuser789',
        phone: '+8613800138004'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateEmailData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('已被使用');
    });

    it('should return error for invalid password format', async () => {
      const invalidPasswordData = {
        ...validUserData,
        password: 'weakpass' // 不符合密码要求
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('请求参数错误');
    });

    it('should return error for invalid email format', async () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('请求参数错误');
    });
  });

  describe('POST /api/auth/login', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser123',
        phone: '+8613800138000',
        email: 'test@example.com',
        password: 'Password123',
        nickname: 'Test User'
      });
    });

    it('should login successfully with email', async () => {
      const loginData = {
        identifier: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should login successfully with username', async () => {
      const loginData = {
        identifier: 'testuser123',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(user.username);
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        identifier: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('密码错误');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        identifier: 'nonexistent@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('密码错误');
    });
  });

  describe('POST /api/auth/send-sms', () => {
    it('should send SMS verification code', async () => {
      const smsData = {
        phone: '+8613800138000',
        type: 'register'
      };

      const response = await request(app)
        .post('/api/auth/send-sms')
        .send(smsData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('验证码发送成功');
    });

    it('should return error for invalid phone number', async () => {
      const smsData = {
        phone: '123456789',
        type: 'register'
      };

      const response = await request(app)
        .post('/api/auth/send-sms')
        .send(smsData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('请求参数错误');
    });

    it('should return error for invalid type', async () => {
      const smsData = {
        phone: '+8613800138000',
        type: 'invalid'
      };

      const response = await request(app)
        .post('/api/auth/send-sms')
        .send(smsData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('请求参数错误');
    });
  });

  describe('GET /api/auth/status', () => {
    let user;
    let token;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser123',
        phone: '+8613800138000',
        email: 'test@example.com',
        password: 'Password123',
        nickname: 'Test User'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'test@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.data.token;
    });

    it('should return user status when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    it('should return error when no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('缺少访问令牌');
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('无效的访问令牌');
    });
  });

  describe('POST /api/auth/logout', () => {
    let user;
    let token;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser123',
        phone: '+8613800138000',
        email: 'test@example.com',
        password: 'Password123',
        nickname: 'Test User'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'test@example.com',
          password: 'Password123'
        });

      token = loginResponse.body.data.token;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('登出成功');
    });

    it('should return error when no token provided', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('缺少访问令牌');
    });
  });
}); 
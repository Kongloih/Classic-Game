const request = require('supertest');
const express = require('express');
const authRoutes = require('../auth');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '用户注册成功');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should return error for invalid email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('邮箱格式不正确');
    });

    test('should return error for password mismatch', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('密码确认不匹配');
    });

    test('should return error for existing username', async () => {
      const userData = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('用户名已存在');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '登录成功');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', loginData.username);
    });

    test('should return error for invalid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('用户名或密码错误');
    });

    test('should return error for missing fields', async () => {
      const loginData = {
        username: 'testuser'
        // missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('用户名和密码不能为空');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', '登出成功');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should return user profile when authenticated', async () => {
      // 模拟认证中间件
      const mockAuthMiddleware = (req, res, next) => {
        req.user = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        };
        next();
      };

      const appWithAuth = express();
      appWithAuth.use(express.json());
      appWithAuth.use('/api/auth', (req, res, next) => {
        if (req.path === '/profile') {
          mockAuthMiddleware(req, res, next);
        } else {
          next();
        }
      });
      appWithAuth.use('/api/auth', authRoutes);

      const response = await request(appWithAuth)
        .get('/api/auth/profile')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    test('should return error when not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('未授权访问');
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer valid-refresh-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    test('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('无效的刷新令牌');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send password reset email successfully', async () => {
      const emailData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('密码重置邮件已发送');
    });

    test('should return error for non-existent email', async () => {
      const emailData = {
        email: 'nonexistent@example.com'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(emailData)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('用户不存在');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should reset password successfully', async () => {
      const resetData = {
        token: 'valid-reset-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('密码重置成功');
    });

    test('should return error for invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('无效的重置令牌');
    });
  });
}); 
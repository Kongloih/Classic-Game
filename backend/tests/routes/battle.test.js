const request = require('supertest');
const express = require('express');
const battleRoutes = require('../../src/routes/battle');
const BattleService = require('../../src/services/battleService');
const UserStatus = require('../../src/models/UserStatus');
const { mockRooms, mockTables, mockUserStatus } = require('../mocks/battleMocks');

// Mock BattleService
jest.mock('../../src/services/battleService');

// Mock UserStatus model
jest.mock('../../src/models/UserStatus');

// Mock 认证中间件
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
};

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/battles', mockAuthMiddleware, battleRoutes);

describe('Battle API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/battles/rooms/:gameId', () => {
    it('应该成功获取游戏房间列表', async () => {
      // Arrange
      const gameId = 1;
      const expectedRooms = mockRooms.filter(room => room.game_id === gameId);
      BattleService.getGameRooms.mockResolvedValue(expectedRooms);

      // Act
      const response = await request(app)
        .get(`/api/battles/rooms/${gameId}`)
        .expect(200);

      // Assert
      expect(BattleService.getGameRooms).toHaveBeenCalledWith(gameId);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('room_id', 'room_1');
    });

    it('应该处理服务层错误', async () => {
      // Arrange
      const gameId = 1;
      const error = new Error('获取房间失败');
      BattleService.getGameRooms.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get(`/api/battles/rooms/${gameId}`)
        .expect(500);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('获取房间列表失败');
    });
  });

  describe('GET /api/battles/tables/:roomId', () => {
    it('应该成功获取房间桌子列表', async () => {
      // Arrange
      const roomId = 1;
      const expectedTables = mockTables.filter(table => table.room_id === roomId);
      BattleService.getRoomTables.mockResolvedValue(expectedTables);

      // Act
      const response = await request(app)
        .get(`/api/battles/tables/${roomId}`)
        .expect(200);

      // Assert
      expect(BattleService.getRoomTables).toHaveBeenCalledWith(roomId);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('table_id', 'table_1');
    });
  });

  describe('POST /api/battles/rooms/:roomId/enter', () => {
    it('应该成功让用户进入房间', async () => {
      // Arrange
      const roomId = 1;
      const result = { success: true, room: mockRooms[0] };
      BattleService.userEnterRoom.mockResolvedValue(result);

      // Act
      const response = await request(app)
        .post(`/api/battles/rooms/${roomId}/enter`)
        .expect(200);

      // Assert
      expect(BattleService.userEnterRoom).toHaveBeenCalledWith(1, roomId);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('成功进入房间');
    });

    it('应该处理房间满员的情况', async () => {
      // Arrange
      const roomId = 2;
      const error = new Error('房间已满员');
      BattleService.userEnterRoom.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post(`/api/battles/rooms/${roomId}/enter`)
        .expect(500);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('房间已满员');
    });
  });

  describe('POST /api/battles/rooms/:roomId/leave', () => {
    it('应该成功让用户离开房间', async () => {
      // Arrange
      const roomId = 1;
      const result = { success: true };
      BattleService.userLeaveRoom.mockResolvedValue(result);

      // Act
      const response = await request(app)
        .post(`/api/battles/rooms/${roomId}/leave`)
        .expect(200);

      // Assert
      expect(BattleService.userLeaveRoom).toHaveBeenCalledWith(1, roomId);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('成功离开房间');
    });
  });

  describe('POST /api/battles/tables/:tableId/join', () => {
    it('应该成功让用户加入桌子座位', async () => {
      // Arrange
      const tableId = 1;
      const seatNumber = 1;
      const result = { success: true, table: mockTables[0] };
      BattleService.userJoinTable.mockResolvedValue(result);

      // Act
      const response = await request(app)
        .post(`/api/battles/tables/${tableId}/join`)
        .send({ seatNumber })
        .expect(200);

      // Assert
      expect(BattleService.userJoinTable).toHaveBeenCalledWith(1, tableId, seatNumber);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('成功加入座位');
    });

    it('应该验证座位号参数', async () => {
      // Arrange
      const tableId = 1;

      // Act - 无效座位号
      const response1 = await request(app)
        .post(`/api/battles/tables/${tableId}/join`)
        .send({ seatNumber: 0 })
        .expect(400);

      // Act - 座位号超出范围
      const response2 = await request(app)
        .post(`/api/battles/tables/${tableId}/join`)
        .send({ seatNumber: 5 })
        .expect(400);

      // Act - 缺少座位号
      const response3 = await request(app)
        .post(`/api/battles/tables/${tableId}/join`)
        .send({})
        .expect(400);

      // Assert
      expect(response1.body.message).toBe('座位号无效');
      expect(response2.body.message).toBe('座位号无效');
      expect(response3.body.message).toBe('座位号无效');
    });

    it('应该处理座位已被占用的情况', async () => {
      // Arrange
      const tableId = 1;
      const seatNumber = 1;
      const error = new Error('座位已被占用');
      BattleService.userJoinTable.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .post(`/api/battles/tables/${tableId}/join`)
        .send({ seatNumber })
        .expect(500);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('座位已被占用');
    });
  });

  describe('POST /api/battles/tables/:tableId/leave', () => {
    it('应该成功让用户离开桌子座位', async () => {
      // Arrange
      const tableId = 1;
      const result = { success: true };
      BattleService.getUserSeat.mockResolvedValue(1);
      BattleService.userLeaveTable.mockResolvedValue(result);

      // Act
      const response = await request(app)
        .post(`/api/battles/tables/${tableId}/leave`)
        .expect(200);

      // Assert
      expect(BattleService.getUserSeat).toHaveBeenCalledWith(1, tableId);
      expect(BattleService.userLeaveTable).toHaveBeenCalledWith(1, tableId, 1);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('成功离开座位');
    });

    it('应该处理用户不在桌子中的情况', async () => {
      // Arrange
      const tableId = 1;
      BattleService.getUserSeat.mockResolvedValue(null);

      // Act
      const response = await request(app)
        .post(`/api/battles/tables/${tableId}/leave`)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户不在该桌子中');
    });
  });

  describe('POST /api/battles/tables/:tableId/start', () => {
    it('应该返回游戏开始响应', async () => {
      // Arrange
      const tableId = 1;

      // Act
      const response = await request(app)
        .post(`/api/battles/tables/${tableId}/start`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('游戏开始');
    });
  });

  describe('GET /api/battles/user/status', () => {
    it('应该成功获取用户状态', async () => {
      // Arrange
      const userStatus = mockUserStatus[0];
      UserStatus.findOne.mockResolvedValue(userStatus);

      // Act
      const response = await request(app)
        .get('/api/battles/user/status')
        .expect(200);

      // Assert
      expect(UserStatus.findOne).toHaveBeenCalledWith({
        where: { user_id: 1 }
      });
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(userStatus);
    });

    it('应该处理获取用户状态失败的情况', async () => {
      // Arrange
      const error = new Error('获取用户状态失败');
      UserStatus.findOne.mockRejectedValue(error);

      // Act
      const response = await request(app)
        .get('/api/battles/user/status')
        .expect(500);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('获取用户状态失败');
    });
  });
}); 
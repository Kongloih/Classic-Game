const request = require('supertest');
const express = require('express');
const battleRoutes = require('../../src/routes/battle');
const BattleService = require('../../src/services/battleService');
const { mockRooms, mockTables, mockUserStatus } = require('../mocks/battleMocks');

// Mock 认证中间件
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, username: 'testuser' };
  next();
};

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/battles', mockAuthMiddleware, battleRoutes);

describe('Battle System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('完整的房间和桌子操作流程', () => {
    it('应该支持完整的用户操作流程', async () => {
      // 1. 获取游戏房间列表
      BattleService.getGameRooms.mockResolvedValue(mockRooms.filter(r => r.game_id === 1));
      
      const roomsResponse = await request(app)
        .get('/api/battles/rooms/1')
        .expect(200);

      expect(roomsResponse.body.success).toBe(true);
      expect(roomsResponse.body.data).toHaveLength(2);

      // 2. 进入房间
      const roomId = 1;
      BattleService.userEnterRoom.mockResolvedValue({ 
        success: true, 
        room: mockRooms[0] 
      });

      const enterResponse = await request(app)
        .post(`/api/battles/rooms/${roomId}/enter`)
        .expect(200);

      expect(enterResponse.body.success).toBe(true);

      // 3. 获取房间桌子列表
      BattleService.getRoomTables.mockResolvedValue(mockTables.filter(t => t.room_id === roomId));

      const tablesResponse = await request(app)
        .get(`/api/battles/tables/${roomId}`)
        .expect(200);

      expect(tablesResponse.body.success).toBe(true);
      expect(tablesResponse.body.data).toHaveLength(2);

      // 4. 加入桌子座位
      const tableId = 3; // 空桌子
      const seatNumber = 1;
      BattleService.userJoinTable.mockResolvedValue({ 
        success: true, 
        table: mockTables[2] 
      });

      const joinResponse = await request(app)
        .post(`/api/battles/tables/${tableId}/join`)
        .send({ seatNumber })
        .expect(200);

      expect(joinResponse.body.success).toBe(true);

      // 5. 离开桌子座位
      BattleService.getUserSeat.mockResolvedValue(seatNumber);
      BattleService.userLeaveTable.mockResolvedValue({ success: true });

      const leaveTableResponse = await request(app)
        .post(`/api/battles/tables/${tableId}/leave`)
        .expect(200);

      expect(leaveTableResponse.body.success).toBe(true);

      // 6. 离开房间
      BattleService.userLeaveRoom.mockResolvedValue({ success: true });

      const leaveRoomResponse = await request(app)
        .post(`/api/battles/rooms/${roomId}/leave`)
        .expect(200);

      expect(leaveRoomResponse.body.success).toBe(true);
    });
  });

  describe('错误处理流程', () => {
    it('应该正确处理各种错误情况', async () => {
      // 1. 房间不存在
      BattleService.userEnterRoom.mockRejectedValue(new Error('房间不存在'));

      const response1 = await request(app)
        .post('/api/battles/rooms/999/enter')
        .expect(500);

      expect(response1.body.success).toBe(false);
      expect(response1.body.message).toBe('房间不存在');

      // 2. 房间已满员
      BattleService.userEnterRoom.mockRejectedValue(new Error('房间已满员'));

      const response2 = await request(app)
        .post('/api/battles/rooms/2/enter')
        .expect(500);

      expect(response2.body.success).toBe(false);
      expect(response2.body.message).toBe('房间已满员');

      // 3. 座位已被占用
      BattleService.userJoinTable.mockRejectedValue(new Error('座位已被占用'));

      const response3 = await request(app)
        .post('/api/battles/tables/1/join')
        .send({ seatNumber: 1 })
        .expect(500);

      expect(response3.body.success).toBe(false);
      expect(response3.body.message).toBe('座位已被占用');

      // 4. 用户不在桌子中
      BattleService.getUserSeat.mockResolvedValue(null);

      const response4 = await request(app)
        .post('/api/battles/tables/1/leave')
        .expect(400);

      expect(response4.body.success).toBe(false);
      expect(response4.body.message).toBe('用户不在该桌子中');
    });
  });

  describe('参数验证', () => {
    it('应该验证所有必要的参数', async () => {
      // 1. 座位号验证
      const invalidSeatNumbers = [0, 5, -1, 'invalid'];
      
      for (const seatNumber of invalidSeatNumbers) {
        const response = await request(app)
          .post('/api/battles/tables/1/join')
          .send({ seatNumber })
          .expect(400);

        expect(response.body.message).toBe('座位号无效');
      }

      // 2. 缺少座位号
      const response = await request(app)
        .post('/api/battles/tables/1/join')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('座位号无效');
    });
  });

  describe('并发操作处理', () => {
    it('应该处理并发进入房间的情况', async () => {
      const roomId = 1;
      const promises = [];

      // 模拟10个用户同时进入房间
      for (let i = 1; i <= 10; i++) {
        BattleService.userEnterRoom.mockResolvedValueOnce({ 
          success: true, 
          room: { ...mockRooms[0], online_users: i } 
        });

        promises.push(
          request(app)
            .post(`/api/battles/rooms/${roomId}/enter`)
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);

      // 验证所有请求都成功
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      // 验证服务被调用了10次
      expect(BattleService.userEnterRoom).toHaveBeenCalledTimes(10);
    });

    it('应该处理并发加入座位的情况', async () => {
      const tableId = 3;
      const promises = [];

      // 模拟4个用户同时加入不同座位
      for (let seatNumber = 1; seatNumber <= 4; seatNumber++) {
        BattleService.userJoinTable.mockResolvedValueOnce({ 
          success: true, 
          table: { ...mockTables[2], [`seat_${seatNumber}_user_id`]: seatNumber } 
        });

        promises.push(
          request(app)
            .post(`/api/battles/tables/${tableId}/join`)
            .send({ seatNumber })
            .expect(200)
        );
      }

      const responses = await Promise.all(promises);

      // 验证所有请求都成功
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });

      // 验证服务被调用了4次
      expect(BattleService.userJoinTable).toHaveBeenCalledTimes(4);
    });
  });

  describe('数据一致性', () => {
    it('应该保持用户状态的一致性', async () => {
      const userId = 1;
      const roomId = 1;
      const tableId = 1;
      const seatNumber = 1;

      // 1. 进入房间
      BattleService.userEnterRoom.mockResolvedValue({ success: true, room: mockRooms[0] });
      
      await request(app)
        .post(`/api/battles/rooms/${roomId}/enter`)
        .expect(200);

      // 2. 加入座位
      BattleService.userJoinTable.mockResolvedValue({ success: true, table: mockTables[0] });
      
      await request(app)
        .post(`/api/battles/tables/${tableId}/join`)
        .send({ seatNumber })
        .expect(200);

      // 3. 验证服务调用参数
      expect(BattleService.userEnterRoom).toHaveBeenCalledWith(userId, roomId);
      expect(BattleService.userJoinTable).toHaveBeenCalledWith(userId, tableId, seatNumber);
    });
  });
}); 
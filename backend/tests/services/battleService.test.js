const BattleService = require('../../src/services/battleService');
const BattleRoom = require('../../src/models/BattleRoom');
const BattleTable = require('../../src/models/BattleTable');
const UserStatus = require('../../src/models/UserStatus');
const User = require('../../src/models/User');
const { mockRooms, mockTables, mockUsers, mockUserStatus, mockTablesWithUsers } = require('../mocks/battleMocks');

// Mock 所有模型
jest.mock('../../src/models/BattleRoom');
jest.mock('../../src/models/BattleTable');
jest.mock('../../src/models/UserStatus');
jest.mock('../../src/models/User');

describe('BattleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGameRooms', () => {
    it('应该成功获取游戏房间列表', async () => {
      // Arrange
      const gameId = 1;
      const expectedRooms = mockRooms.filter(room => room.game_id === gameId);
      
      BattleRoom.findAll.mockResolvedValue(expectedRooms);

      // Act
      const result = await BattleService.getGameRooms(gameId);

      // Assert
      expect(BattleRoom.findAll).toHaveBeenCalledWith({
        where: { game_id: gameId },
        order: [['room_id', 'ASC']]
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('room_id', 'room_1');
      expect(result[0]).toHaveProperty('status', '未满员');
      expect(result[0]).toHaveProperty('online_users', 45);
    });

    it('应该处理数据库错误', async () => {
      // Arrange
      const gameId = 1;
      const error = new Error('数据库连接失败');
      BattleRoom.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(BattleService.getGameRooms(gameId)).rejects.toThrow('数据库连接失败');
    });
  });

  describe('getRoomTables', () => {
    it('应该成功获取房间桌子列表', async () => {
      // Arrange
      const roomId = 1;
      const expectedTables = mockTablesWithUsers.filter(table => table.room_id === roomId);
      
      BattleTable.findAll.mockResolvedValue(expectedTables);

      // Act
      const result = await BattleService.getRoomTables(roomId);

      // Assert
      expect(BattleTable.findAll).toHaveBeenCalledWith({
        where: { room_id: roomId },
        order: [['table_id', 'ASC']],
        include: expect.arrayContaining([
          expect.objectContaining({ model: User, as: 'seat1User' }),
          expect.objectContaining({ model: User, as: 'seat2User' }),
          expect.objectContaining({ model: User, as: 'seat3User' }),
          expect.objectContaining({ model: User, as: 'seat4User' })
        ])
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('table_id', 'table_1');
      expect(result[0]).toHaveProperty('status', 'waiting');
      expect(result[0].seats).toHaveProperty('1');
      expect(result[0].seats).toHaveProperty('2');
    });
  });

  describe('userEnterRoom', () => {
    it('应该成功让用户进入房间', async () => {
      // Arrange
      const userId = 1;
      const roomId = 1;
      const room = { ...mockRooms[0], increment: jest.fn(), update: jest.fn() };
      
      BattleRoom.findByPk.mockResolvedValue(room);
      UserStatus.upsert.mockResolvedValue([{ id: 1 }, true]);

      // Act
      const result = await BattleService.userEnterRoom(userId, roomId);

      // Assert
      expect(BattleRoom.findByPk).toHaveBeenCalledWith(roomId);
      expect(UserStatus.upsert).toHaveBeenCalledWith({
        user_id: userId,
        room_id: roomId,
        table_id: null,
        seat_number: null,
        status: 'idle',
        last_activity: expect.any(Date)
      });
      expect(room.increment).toHaveBeenCalledWith('online_users');
      expect(result.success).toBe(true);
    });

    it('应该拒绝进入已满员的房间', async () => {
      // Arrange
      const userId = 1;
      const roomId = 2; // 满员房间
      const room = { ...mockRooms[1] };
      
      BattleRoom.findByPk.mockResolvedValue(room);

      // Act & Assert
      await expect(BattleService.userEnterRoom(userId, roomId)).rejects.toThrow('房间已满员');
    });

    it('应该处理房间不存在的情况', async () => {
      // Arrange
      const userId = 1;
      const roomId = 999;
      
      BattleRoom.findByPk.mockResolvedValue(null);

      // Act & Assert
      await expect(BattleService.userEnterRoom(userId, roomId)).rejects.toThrow('房间不存在');
    });
  });

  describe('userLeaveRoom', () => {
    it('应该成功让用户离开房间', async () => {
      // Arrange
      const userId = 1;
      const roomId = 1;
      const room = { ...mockRooms[0], decrement: jest.fn(), update: jest.fn() };
      const userStatus = { table_id: 1, seat_number: 1 };
      
      BattleRoom.findByPk.mockResolvedValue(room);
      UserStatus.findOne.mockResolvedValue(userStatus);
      UserStatus.update.mockResolvedValue([1]);

      // Mock userLeaveTable
      const originalUserLeaveTable = BattleService.userLeaveTable;
      BattleService.userLeaveTable = jest.fn().mockResolvedValue({ success: true });

      // Act
      const result = await BattleService.userLeaveRoom(userId, roomId);

      // Assert
      expect(BattleRoom.findByPk).toHaveBeenCalledWith(roomId);
      expect(UserStatus.findOne).toHaveBeenCalledWith({
        where: { user_id: userId }
      });
      expect(BattleService.userLeaveTable).toHaveBeenCalledWith(userId, 1, 1);
      expect(UserStatus.update).toHaveBeenCalledWith({
        room_id: null,
        table_id: null,
        seat_number: null,
        status: 'idle',
        last_activity: expect.any(Date)
      }, {
        where: { user_id: userId }
      });
      expect(room.decrement).toHaveBeenCalledWith('online_users');
      expect(result.success).toBe(true);

      // Restore original method
      BattleService.userLeaveTable = originalUserLeaveTable;
    });
  });

  describe('userJoinTable', () => {
    it('应该成功让用户加入桌子座位', async () => {
      // Arrange
      const userId = 5;
      const tableId = 3; // 空桌子
      const seatNumber = 1;
      const table = { ...mockTables[2], update: jest.fn() };
      
      BattleTable.findByPk.mockResolvedValue(table);
      UserStatus.update.mockResolvedValue([1]);

      // Mock getUserSeat
      const originalGetUserSeat = BattleService.getUserSeat;
      BattleService.getUserSeat = jest.fn().mockResolvedValue(null);

      // Act
      const result = await BattleService.userJoinTable(userId, tableId, seatNumber);

      // Assert
      expect(BattleTable.findByPk).toHaveBeenCalledWith(tableId);
      expect(BattleService.getUserSeat).toHaveBeenCalledWith(userId, tableId);
      expect(table.update).toHaveBeenCalledWith({
        seat_1_user_id: userId,
        current_players: 1,
        status: 'empty'
      });
      expect(UserStatus.update).toHaveBeenCalledWith({
        table_id: tableId,
        seat_number: seatNumber,
        status: 'waiting',
        last_activity: expect.any(Date)
      }, {
        where: { user_id: userId }
      });
      expect(result.success).toBe(true);

      // Restore original method
      BattleService.getUserSeat = originalGetUserSeat;
    });

    it('应该拒绝加入已被占用的座位', async () => {
      // Arrange
      const userId = 5;
      const tableId = 1; // 有人的桌子
      const seatNumber = 1;
      const table = { ...mockTables[0] };
      
      BattleTable.findByPk.mockResolvedValue(table);

      // Act & Assert
      await expect(BattleService.userJoinTable(userId, tableId, seatNumber)).rejects.toThrow('座位已被占用');
    });

    it('应该拒绝已在其他座位的用户', async () => {
      // Arrange
      const userId = 1;
      const tableId = 3;
      const seatNumber = 1;
      const table = { ...mockTables[2] };
      
      BattleTable.findByPk.mockResolvedValue(table);

      // Mock getUserSeat
      const originalGetUserSeat = BattleService.getUserSeat;
      BattleService.getUserSeat = jest.fn().mockResolvedValue(2);

      // Act & Assert
      await expect(BattleService.userJoinTable(userId, tableId, seatNumber)).rejects.toThrow('用户已在其他座位');

      // Restore original method
      BattleService.getUserSeat = originalGetUserSeat;
    });
  });

  describe('userLeaveTable', () => {
    it('应该成功让用户离开桌子座位', async () => {
      // Arrange
      const userId = 1;
      const tableId = 1;
      const seatNumber = 1;
      const table = { ...mockTables[0], update: jest.fn() };
      
      BattleTable.findByPk.mockResolvedValue(table);
      UserStatus.update.mockResolvedValue([1]);

      // Act
      const result = await BattleService.userLeaveTable(userId, tableId, seatNumber);

      // Assert
      expect(BattleTable.findByPk).toHaveBeenCalledWith(tableId);
      expect(table.update).toHaveBeenCalledWith({
        seat_1_user_id: null,
        current_players: 1,
        status: 'empty'
      });
      expect(UserStatus.update).toHaveBeenCalledWith({
        table_id: null,
        seat_number: null,
        status: 'idle',
        last_activity: expect.any(Date)
      }, {
        where: { user_id: userId }
      });
      expect(result.success).toBe(true);
    });

    it('应该拒绝离开不属于用户的座位', async () => {
      // Arrange
      const userId = 999;
      const tableId = 1;
      const seatNumber = 1;
      const table = { ...mockTables[0] };
      
      BattleTable.findByPk.mockResolvedValue(table);

      // Act & Assert
      await expect(BattleService.userLeaveTable(userId, tableId, seatNumber)).rejects.toThrow('用户不在该座位');
    });
  });

  describe('getUserSeat', () => {
    it('应该返回用户所在的座位号', async () => {
      // Arrange
      const userId = 1;
      const tableId = 1;
      const table = { ...mockTables[0] };
      
      BattleTable.findByPk.mockResolvedValue(table);

      // Act
      const result = await BattleService.getUserSeat(userId, tableId);

      // Assert
      expect(BattleTable.findByPk).toHaveBeenCalledWith(tableId);
      expect(result).toBe(1);
    });

    it('应该返回null当用户不在桌子中', async () => {
      // Arrange
      const userId = 999;
      const tableId = 1;
      const table = { ...mockTables[0] };
      
      BattleTable.findByPk.mockResolvedValue(table);

      // Act
      const result = await BattleService.getUserSeat(userId, tableId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('cleanupTimeoutUsers', () => {
    it('应该清理超时用户', async () => {
      // Arrange
      const timeoutUsers = [mockUserStatus[3]]; // 5分钟前活动的用户
      
      UserStatus.findAll.mockResolvedValue(timeoutUsers);

      // Mock userLeaveTable and userLeaveRoom
      const originalUserLeaveTable = BattleService.userLeaveTable;
      const originalUserLeaveRoom = BattleService.userLeaveRoom;
      BattleService.userLeaveTable = jest.fn().mockResolvedValue({ success: true });
      BattleService.userLeaveRoom = jest.fn().mockResolvedValue({ success: true });

      // Act
      const result = await BattleService.cleanupTimeoutUsers();

      // Assert
      expect(UserStatus.findAll).toHaveBeenCalledWith({
        where: {
          last_activity: {
            $lt: expect.any(Date)
          },
          status: ['waiting', 'playing']
        }
      });
      expect(result).toBe(1);

      // Restore original methods
      BattleService.userLeaveTable = originalUserLeaveTable;
      BattleService.userLeaveRoom = originalUserLeaveRoom;
    });

    it('应该处理清理过程中的错误', async () => {
      // Arrange
      const error = new Error('清理失败');
      UserStatus.findAll.mockRejectedValue(error);

      // Act
      const result = await BattleService.cleanupTimeoutUsers();

      // Assert
      expect(result).toBe(0);
    });
  });
}); 
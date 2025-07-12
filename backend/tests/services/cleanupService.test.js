const CleanupService = require('../../src/services/cleanupService');
const BattleService = require('../../src/services/battleService');
const UserStatus = require('../../src/models/UserStatus');
const { mockUserStatus } = require('../mocks/battleMocks');

// Mock BattleService
jest.mock('../../src/services/battleService');

// Mock UserStatus model
jest.mock('../../src/models/UserStatus');

describe('CleanupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('cleanupTimeoutUsers', () => {
    it('应该成功清理超时用户', async () => {
      // Arrange
      const timeoutUsers = [mockUserStatus[3]]; // 5分钟前活动的用户
      const cleanedCount = 1;
      
      BattleService.cleanupTimeoutUsers.mockResolvedValue(cleanedCount);

      // Act
      const result = await CleanupService.cleanupTimeoutUsers();

      // Assert
      expect(BattleService.cleanupTimeoutUsers).toHaveBeenCalled();
      expect(result).toBe(cleanedCount);
    });

    it('应该处理清理过程中的错误', async () => {
      // Arrange
      const error = new Error('清理失败');
      BattleService.cleanupTimeoutUsers.mockRejectedValue(error);

      // Act
      const result = await CleanupService.cleanupTimeoutUsers();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('cleanupExpiredUserStatus', () => {
    it('应该成功清理过期的用户状态记录', async () => {
      // Arrange
      const deletedCount = 5;
      UserStatus.destroy.mockResolvedValue(deletedCount);

      // Act
      const result = await CleanupService.cleanupExpiredUserStatus();

      // Assert
      expect(UserStatus.destroy).toHaveBeenCalledWith({
        where: {
          last_activity: {
            $lt: expect.any(Date)
          },
          status: 'idle'
        }
      });
      expect(result).toBe(deletedCount);
    });

    it('应该处理清理过程中的错误', async () => {
      // Arrange
      const error = new Error('清理失败');
      UserStatus.destroy.mockRejectedValue(error);

      // Act
      const result = await CleanupService.cleanupExpiredUserStatus();

      // Assert
      expect(result).toBe(0);
    });

    it('应该在没有过期记录时返回0', async () => {
      // Arrange
      UserStatus.destroy.mockResolvedValue(0);

      // Act
      const result = await CleanupService.cleanupExpiredUserStatus();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe('startCleanupTasks', () => {
    it('应该启动定时清理任务', () => {
      // Arrange
      const mockSetInterval = jest.spyOn(global, 'setInterval');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      CleanupService.startCleanupTasks();

      // Assert
      expect(mockSetInterval).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith('🕐 启动定时清理任务...');
      expect(consoleSpy).toHaveBeenCalledWith('✅ 定时清理任务已启动');

      // Cleanup
      mockSetInterval.mockRestore();
      consoleSpy.mockRestore();
    });

    it('应该设置正确的定时器间隔', () => {
      // Arrange
      const mockSetInterval = jest.spyOn(global, 'setInterval');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      CleanupService.startCleanupTasks();

      // Assert
      expect(mockSetInterval).toHaveBeenNthCalledWith(1, expect.any(Function), 30000); // 30秒
      expect(mockSetInterval).toHaveBeenNthCalledWith(2, expect.any(Function), 60 * 60 * 1000); // 1小时

      // Cleanup
      mockSetInterval.mockRestore();
      consoleSpy.mockRestore();
    });
  });
}); 
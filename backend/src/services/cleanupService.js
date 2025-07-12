const BattleService = require('./battleService');
const UserStatus = require('../models/UserStatus');
const { Op } = require('sequelize');

class CleanupService {
  // 清理超时用户
  static async cleanupTimeoutUsers() {
    try {
      console.log('🧹 开始清理超时用户...');
      const cleanedCount = await BattleService.cleanupTimeoutUsers();
      console.log(`✅ 清理了 ${cleanedCount} 个超时用户`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ 清理超时用户失败:', error);
      return 0;
    }
  }

  // 清理过期的用户状态记录
  static async cleanupExpiredUserStatus() {
    try {
      const expiredTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时前
      
      const deletedCount = await UserStatus.destroy({
        where: {
          last_activity: {
            [Op.lt]: expiredTime
          },
          status: 'idle'
        }
      });

      if (deletedCount > 0) {
        console.log(`🧹 清理了 ${deletedCount} 条过期的用户状态记录`);
      }

      return deletedCount;
    } catch (error) {
      console.error('❌ 清理过期用户状态失败:', error);
      return 0;
    }
  }

  // 启动定时清理任务
  static startCleanupTasks() {
    console.log('🕐 启动定时清理任务...');
    
    // 每30秒清理一次超时用户
    setInterval(async () => {
      await this.cleanupTimeoutUsers();
    }, 30000);

    // 每小时清理一次过期用户状态
    setInterval(async () => {
      await this.cleanupExpiredUserStatus();
    }, 60 * 60 * 1000);

    console.log('✅ 定时清理任务已启动');
  }
}

module.exports = CleanupService; 
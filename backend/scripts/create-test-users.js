const User = require('../src/models/User');
const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查User模型是否正确加载
    if (!User || typeof User.create !== 'function') {
      throw new Error('User模型加载失败');
    }

    // 检查是否已存在测试用户
    const existingUser1 = await User.findOne({ where: { username: 'player1' } });
    const existingUser2 = await User.findOne({ where: { username: 'player2' } });

    if (existingUser1) {
      console.log('⚠️ 用户 player1 已存在，跳过创建');
    } else {
      // 创建第一个测试用户
      const user1 = await User.create({
        username: 'player1',
        email: 'player1@test.com',
        password: 'password123', // 会自动通过beforeCreate钩子加密
        nickname: '玩家1',
        avatar: null,
        level: 1,
        experience: 0,
        coins: 1000,
        diamonds: 50,
        status: 'active',
        is_verified: true,
        total_games: 0,
        total_wins: 0,
        total_losses: 0,
        total_draws: 0,
        highest_score: 0
      });

      console.log('✅ 创建用户1成功:', {
        id: user1.id,
        username: user1.username,
        email: user1.email
      });
    }

    if (existingUser2) {
      console.log('⚠️ 用户 player2 已存在，跳过创建');
    } else {
      // 创建第二个测试用户
      const user2 = await User.create({
        username: 'player2',
        email: 'player2@test.com',
        password: 'password123', // 会自动通过beforeCreate钩子加密
        nickname: '玩家2',
        avatar: null,
        level: 1,
        experience: 0,
        coins: 1000,
        diamonds: 50,
        status: 'active',
        is_verified: true,
        total_games: 0,
        total_wins: 0,
        total_losses: 0,
        total_draws: 0,
        highest_score: 0
      });

      console.log('✅ 创建用户2成功:', {
        id: user2.id,
        username: user2.username,
        email: user2.email
      });
    }

    console.log('\n🎮 测试用户创建完成！');
    console.log('📋 用户信息：');
    console.log('用户1:');
    console.log('  用户名: player1');
    console.log('  邮箱: player1@test.com');
    console.log('  密码: password123');
    console.log('');
    console.log('用户2:');
    console.log('  用户名: player2');
    console.log('  邮箱: player2@test.com');
    console.log('  密码: password123');
    console.log('');
    console.log('💡 使用说明：');
    console.log('1. 启动后端服务器: npm run dev');
    console.log('2. 启动前端应用: cd ../frontend && npm start');
    console.log('3. 在两个不同的浏览器或隐私窗口中分别登录这两个用户');
    console.log('4. 进入同一个游戏房间进行测试');

  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  } finally {
    await sequelize.close();
  }
}

createTestUsers(); 
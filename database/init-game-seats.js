const { sequelize } = require('../backend/src/config/database');
const Game = require('../backend/src/models/Game');

async function initGameSeats() {
  try {
    console.log('🔧 开始初始化游戏座位配置...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 游戏座位配置
    const gameSeatConfigs = [
      { id: 1, name: '俄罗斯方块', maxSeat: 2, availableSeats: [2, 4] },
      { id: 2, name: '贪吃蛇', maxSeat: 1, availableSeats: [1] },
      { id: 3, name: '打砖块', maxSeat: 1, availableSeats: [1] },
      { id: 4, name: '2048', maxSeat: 1, availableSeats: [1] },
      { id: 5, name: '扫雷', maxSeat: 1, availableSeats: [1] }
    ];
    
    for (const config of gameSeatConfigs) {
      const game = await Game.findByPk(config.id);
      if (game) {
        await game.update({
          max_seat: config.maxSeat,
          available_seats: config.availableSeats
        });
        console.log(`✅ 更新游戏 ${config.name}: 最大座位${config.maxSeat}, 可用座位${config.availableSeats.join(',')}`);
      } else {
        console.log(`⚠️ 游戏ID ${config.id} 不存在`);
      }
    }
    
    // 验证数据
    const games = await Game.findAll({
      where: { id: { [require('sequelize').Op.in]: [1, 2, 3, 4, 5] } },
      order: [['id', 'ASC']]
    });
    
    console.log('📊 游戏座位配置:');
    games.forEach(game => {
      console.log(`  ${game.name}: 最大座位${game.max_seat}, 可用座位${game.available_seats.join(',')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

// 运行初始化
initGameSeats(); 
const { sequelize } = require('../src/config/database');
const Game = require('../src/models/Game');
const BattleRoom = require('../src/models/BattleRoom');
const BattleTable = require('../src/models/BattleTable');
const UserStatus = require('../src/models/UserStatus');

async function initBattleSystem() {
  try {
    console.log('🚀 开始初始化战斗系统...');
    
    // 同步数据库表
    await sequelize.sync({ force: false });
    console.log('✅ 数据库表同步完成');
    
    // 获取所有游戏
    const games = await Game.findAll();
    console.log(`📊 找到 ${games.length} 个游戏`);
    
    // 为每个游戏创建3个房间
    for (const game of games) {
      console.log(`🏠 为游戏 "${game.name}" (ID: ${game.id}) 创建房间...`);
      
      for (let roomNum = 1; roomNum <= 3; roomNum++) {
        const roomId = `room_${roomNum}`;
        
        // 检查房间是否已存在
        const existingRoom = await BattleRoom.findOne({
          where: { room_id: roomId, game_id: game.id }
        });
        
        if (!existingRoom) {
          await BattleRoom.create({
            room_id: roomId,
            game_id: game.id,
            name: `${game.name}房间${roomNum}`,
            status: '未满员',
            online_users: 0,
            max_user: 500,
            max_tables: 50,
            current_tables: 0
          });
          console.log(`  ✅ 创建房间: ${roomId}`);
        } else {
          console.log(`  ⚠️  房间已存在: ${roomId}`);
        }
      }
    }
    
    // 为每个房间创建50张桌子
    const rooms = await BattleRoom.findAll();
    console.log(`📊 找到 ${rooms.length} 个房间，开始创建桌子...`);
    
    for (const room of rooms) {
      console.log(`🃏 为房间 "${room.name}" 创建桌子...`);
      
      for (let tableNum = 1; tableNum <= 50; tableNum++) {
        const tableId = `table_${tableNum}`;
        
        // 检查桌子是否已存在
        const existingTable = await BattleTable.findOne({
          where: { table_id: tableId, room_id: room.id }
        });
        
        if (!existingTable) {
          await BattleTable.create({
            table_id: tableId,
            room_id: room.id,
            seat_1_user_id: null,
            seat_2_user_id: null,
            seat_3_user_id: null,
            seat_4_user_id: null,
            status: 'empty',
            current_players: 0,
            max_players: 4
          });
          
          if (tableNum % 10 === 0) {
            console.log(`  ✅ 已创建 ${tableNum} 张桌子`);
          }
        }
      }
      console.log(`  ✅ 房间 "${room.name}" 桌子创建完成`);
    }
    
    console.log('🎉 战斗系统初始化完成！');
    console.log(`📊 统计信息:`);
    console.log(`  - 游戏数量: ${games.length}`);
    console.log(`  - 房间数量: ${rooms.length}`);
    console.log(`  - 桌子数量: ${rooms.length * 50}`);
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

initBattleSystem(); 
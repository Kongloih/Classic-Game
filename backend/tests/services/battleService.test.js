const { sequelize } = require('../../src/config/database');
const BattleService = require('../../src/services/battleService');
const { BattleTable, BattleRoom, UserStatus, User } = require('../../src/models');

describe('BattleService - 座位切换功能测试', () => {
  let testTable;
  let testUser;
  let testRoom;

  beforeAll(async () => {
    // 创建测试数据
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      status: 'active'
    });

    testRoom = await BattleRoom.create({
      room_id: 'test_room',
      game_id: 1,
      name: '测试房间',
      status: '未满员',
      online_users: 0
    });

    testTable = await BattleTable.create({
      table_id: 'test_table',
      room_id: testRoom.id,
      seat_1_user_id: null,
      seat_2_user_id: null,
      seat_3_user_id: null,
      seat_4_user_id: null,
      status: 'empty',
      current_players: 0,
      max_players: 4
    });
  });

  afterAll(async () => {
    // 清理测试数据
    await BattleTable.destroy({ where: { id: testTable.id } });
    await BattleRoom.destroy({ where: { id: testRoom.id } });
    await User.destroy({ where: { id: testUser.id } });
    await UserStatus.destroy({ where: { user_id: testUser.id } });
    await sequelize.close();
  });

  beforeEach(async () => {
    // 每个测试前重置桌子状态
    await testTable.update({
      seat_1_user_id: null,
      seat_2_user_id: null,
      seat_3_user_id: null,
      seat_4_user_id: null,
      current_players: 0,
      status: 'empty'
    });

    // 清理用户状态
    await UserStatus.destroy({ where: { user_id: testUser.id } });
  });

  describe('userJoinTable - 座位切换功能', () => {
    test('应该允许用户加入空座位', async () => {
      const result = await BattleService.userJoinTable(testUser.id, testTable.id, 1);
      
      expect(result.success).toBe(true);
      expect(result.isSeatSwitch).toBe(false);
      expect(result.oldSeat).toBeNull();

      // 验证数据库状态
      await testTable.reload();
      expect(testTable.seat_1_user_id).toBe(testUser.id);
      expect(testTable.current_players).toBe(1);
    });

    test('应该允许用户从座位1切换到座位2', async () => {
      // 先加入座位1
      await BattleService.userJoinTable(testUser.id, testTable.id, 1);
      
      // 切换到座位2
      const result = await BattleService.userJoinTable(testUser.id, testTable.id, 2);
      
      expect(result.success).toBe(true);
      expect(result.isSeatSwitch).toBe(true);
      expect(result.oldSeat).toBe(1);

      // 验证数据库状态
      await testTable.reload();
      expect(testTable.seat_1_user_id).toBeNull(); // 原座位应该为NULL
      expect(testTable.seat_2_user_id).toBe(testUser.id); // 新座位被占用
      expect(testTable.current_players).toBe(1); // 玩家数量不变
    });

    test('应该允许用户从座位2切换到座位3', async () => {
      // 先加入座位2
      await BattleService.userJoinTable(testUser.id, testTable.id, 2);
      
      // 切换到座位3
      const result = await BattleService.userJoinTable(testUser.id, testTable.id, 3);
      
      expect(result.success).toBe(true);
      expect(result.isSeatSwitch).toBe(true);
      expect(result.oldSeat).toBe(2);

      // 验证数据库状态
      await testTable.reload();
      expect(testTable.seat_2_user_id).toBeNull();
      expect(testTable.seat_3_user_id).toBe(testUser.id);
      expect(testTable.current_players).toBe(1);
    });

    test('不应该允许用户加入已被其他用户占用的座位', async () => {
      // 创建另一个用户
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
        status: 'active'
      });

      // 其他用户占用座位1
      await BattleService.userJoinTable(otherUser.id, testTable.id, 1);

      // 当前用户尝试占用座位1
      await expect(
        BattleService.userJoinTable(testUser.id, testTable.id, 1)
      ).rejects.toThrow('座位已被其他用户占用');

      // 清理
      await User.destroy({ where: { id: otherUser.id } });
    });

    test('不应该允许用户加入已占用的座位（自己占用）', async () => {
      // 用户占用座位1
      await BattleService.userJoinTable(testUser.id, testTable.id, 1);

      // 尝试再次占用座位1
      await expect(
        BattleService.userJoinTable(testUser.id, testTable.id, 1)
      ).rejects.toThrow('用户已在该座位');
    });

    test('应该正确更新用户状态', async () => {
      await BattleService.userJoinTable(testUser.id, testTable.id, 1);

      const userStatus = await UserStatus.findOne({
        where: { user_id: testUser.id }
      });

      expect(userStatus).toBeTruthy();
      expect(userStatus.room_id).toBe(testRoom.id);
      expect(userStatus.table_id).toBe(testTable.id);
      expect(userStatus.seat_number).toBe(1);
      expect(userStatus.status).toBe('waiting');
    });

    test('座位切换时应该更新用户状态', async () => {
      // 先加入座位1
      await BattleService.userJoinTable(testUser.id, testTable.id, 1);
      
      // 切换到座位2
      await BattleService.userJoinTable(testUser.id, testTable.id, 2);

      const userStatus = await UserStatus.findOne({
        where: { user_id: testUser.id }
      });

      expect(userStatus.seat_number).toBe(2);
      expect(userStatus.table_id).toBe(testTable.id);
    });
  });

  describe('userLeaveTable - 离开座位功能', () => {
    test('应该正确释放座位', async () => {
      // 先加入座位
      await BattleService.userJoinTable(testUser.id, testTable.id, 1);
      
      // 离开座位
      const result = await BattleService.userLeaveTable(testUser.id, testTable.id, 1);
      
      expect(result.success).toBe(true);

      // 验证数据库状态
      await testTable.reload();
      expect(testTable.seat_1_user_id).toBeNull();
      expect(testTable.current_players).toBe(0);
      expect(testTable.status).toBe('empty');
    });

    test('离开座位后应该更新用户状态', async () => {
      // 先加入座位
      await BattleService.userJoinTable(testUser.id, testTable.id, 1);
      
      // 离开座位
      await BattleService.userLeaveTable(testUser.id, testTable.id, 1);

      const userStatus = await UserStatus.findOne({
        where: { user_id: testUser.id }
      });

      expect(userStatus.table_id).toBeNull();
      expect(userStatus.seat_number).toBeNull();
      expect(userStatus.status).toBe('idle');
    });
  });

  describe('getUserSeat - 获取用户座位', () => {
    test('应该正确返回用户座位号', async () => {
      await BattleService.userJoinTable(testUser.id, testTable.id, 2);
      
      const seatNumber = await BattleService.getUserSeat(testUser.id, testTable.id);
      expect(seatNumber).toBe(2);
    });

    test('用户不在桌子中时应该返回null', async () => {
      const seatNumber = await BattleService.getUserSeat(testUser.id, testTable.id);
      expect(seatNumber).toBeNull();
    });
  });
}); 
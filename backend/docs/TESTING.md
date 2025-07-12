# 战斗系统测试文档

## 概述

本文档描述了战斗系统的完整测试策略，包括单元测试、集成测试和测试覆盖率。

## 测试结构

```
backend/
├── tests/
│   ├── setup.js                    # 测试环境设置
│   ├── mocks/
│   │   └── battleMocks.js          # Mock数据
│   ├── services/
│   │   ├── battleService.test.js   # 服务层单元测试
│   │   └── cleanupService.test.js  # 清理服务测试
│   ├── routes/
│   │   └── battle.test.js          # API路由测试
│   └── integration/
│       └── battleIntegration.test.js # 集成测试
├── jest.config.js                  # Jest配置
└── scripts/
    └── run-tests.js                # 测试运行脚本
```

## 测试类型

### 1. 单元测试 (Unit Tests)

#### BattleService 测试
- **文件**: `tests/services/battleService.test.js`
- **覆盖范围**: 所有服务方法
- **测试场景**:
  - 获取游戏房间列表
  - 获取房间桌子列表
  - 用户进入/离开房间
  - 用户加入/离开桌子座位
  - 获取用户座位
  - 清理超时用户

#### CleanupService 测试
- **文件**: `tests/services/cleanupService.test.js`
- **覆盖范围**: 清理服务方法
- **测试场景**:
  - 清理超时用户
  - 清理过期用户状态
  - 启动定时清理任务

### 2. API路由测试 (Route Tests)

#### Battle API 测试
- **文件**: `tests/routes/battle.test.js`
- **覆盖范围**: 所有API端点
- **测试场景**:
  - GET /api/battles/rooms/:gameId
  - GET /api/battles/tables/:roomId
  - POST /api/battles/rooms/:roomId/enter
  - POST /api/battles/rooms/:roomId/leave
  - POST /api/battles/tables/:tableId/join
  - POST /api/battles/tables/:tableId/leave
  - POST /api/battles/tables/:tableId/start
  - GET /api/battles/user/status

### 3. 集成测试 (Integration Tests)

#### 完整流程测试
- **文件**: `tests/integration/battleIntegration.test.js`
- **覆盖范围**: 端到端业务流程
- **测试场景**:
  - 完整的用户操作流程
  - 错误处理流程
  - 参数验证
  - 并发操作处理
  - 数据一致性

## Mock数据

### 数据结构
```javascript
// 游戏数据
mockGames = [
  { id: 1, name: '俄罗斯方块', ... },
  { id: 2, name: '贪吃蛇', ... },
  { id: 3, name: '打砖块', ... }
];

// 房间数据
mockRooms = [
  { id: 1, room_id: 'room_1', game_id: 1, status: '未满员', online_users: 45, max_user: 500, ... },
  { id: 2, room_id: 'room_2', game_id: 1, status: '满员', online_users: 500, max_user: 500, ... },
  { id: 3, room_id: 'room_1', game_id: 2, status: '未满员', online_users: 23, max_user: 500, ... }
];

// 桌子数据
mockTables = [
  { id: 1, table_id: 'table_1', room_id: 1, seat_1_user_id: 1, seat_2_user_id: 2, status: 'waiting', ... },
  { id: 2, table_id: 'table_2', room_id: 1, seat_1_user_id: 3, seat_2_user_id: 4, status: 'playing', ... },
  { id: 3, table_id: 'table_1', room_id: 3, seat_1_user_id: null, status: 'empty', ... }
];

// 用户数据
mockUsers = [
  { id: 1, username: 'player1', avatar: 'avatar1.jpg', level: 10, ... },
  { id: 2, username: 'player2', avatar: 'avatar2.jpg', level: 15, ... },
  { id: 3, username: 'player3', avatar: 'avatar3.jpg', level: 8, ... },
  { id: 4, username: 'player4', avatar: 'avatar4.jpg', level: 12, ... }
];

// 用户状态数据
mockUserStatus = [
  { id: 1, user_id: 1, room_id: 1, table_id: 1, seat_number: 1, status: 'waiting', ... },
  { id: 2, user_id: 2, room_id: 1, table_id: 1, seat_number: 2, status: 'waiting', ... },
  { id: 3, user_id: 3, room_id: 1, table_id: 2, seat_number: 1, status: 'playing', ... },
  { id: 4, user_id: 4, room_id: null, table_id: null, seat_number: null, status: 'idle', ... }
];
```

## 运行测试

### 1. 运行所有测试
```bash
cd backend
npm test
```

### 2. 运行测试并监听文件变化
```bash
npm run test:watch
```

### 3. 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

### 4. 运行CI测试
```bash
npm run test:ci
```

### 5. 使用测试脚本
```bash
node scripts/run-tests.js
```

## 测试覆盖率

### 目标覆盖率
- **语句覆盖率**: > 90%
- **分支覆盖率**: > 85%
- **函数覆盖率**: > 95%
- **行覆盖率**: > 90%

### 覆盖率报告
运行 `npm run test:coverage` 后，覆盖率报告将生成在 `coverage/` 目录中：
- `coverage/lcov-report/index.html` - HTML格式报告
- `coverage/lcov.info` - LCOV格式报告

## 测试最佳实践

### 1. 测试命名
- 使用描述性的测试名称
- 遵循 "应该..." 的命名模式
- 包含测试的预期行为

### 2. 测试结构
- 使用 AAA 模式 (Arrange, Act, Assert)
- 每个测试只测试一个功能点
- 保持测试的独立性

### 3. Mock使用
- Mock外部依赖（数据库、API等）
- 使用真实的业务逻辑
- 避免过度Mock

### 4. 错误测试
- 测试所有错误情况
- 验证错误消息
- 测试边界条件

## 常见测试场景

### 1. 房间管理
```javascript
// 测试进入房间
it('应该成功让用户进入房间', async () => {
  // Arrange
  const userId = 1;
  const roomId = 1;
  
  // Act
  const result = await BattleService.userEnterRoom(userId, roomId);
  
  // Assert
  expect(result.success).toBe(true);
});
```

### 2. 座位管理
```javascript
// 测试加入座位
it('应该成功让用户加入桌子座位', async () => {
  // Arrange
  const userId = 5;
  const tableId = 3;
  const seatNumber = 1;
  
  // Act
  const result = await BattleService.userJoinTable(userId, tableId, seatNumber);
  
  // Assert
  expect(result.success).toBe(true);
});
```

### 3. 错误处理
```javascript
// 测试房间满员
it('应该拒绝进入已满员的房间', async () => {
  // Arrange
  const userId = 1;
  const roomId = 2; // 满员房间
  
  // Act & Assert
  await expect(BattleService.userEnterRoom(userId, roomId))
    .rejects.toThrow('房间已满员');
});
```

## 持续集成

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

### 测试环境
- **Node.js**: 18.x
- **数据库**: SQLite (测试环境)
- **缓存**: 内存缓存 (测试环境)

## 故障排除

### 常见问题

1. **测试超时**
   - 检查异步操作是否正确处理
   - 增加测试超时时间

2. **Mock不工作**
   - 确保Mock在测试前设置
   - 检查Mock路径是否正确

3. **数据库连接问题**
   - 使用测试数据库
   - 确保测试环境配置正确

### 调试技巧

1. **使用 console.log**
   ```javascript
   it('调试测试', async () => {
     console.log('测试数据:', mockData);
     // 测试代码
   });
   ```

2. **使用 --verbose 标志**
   ```bash
   npm test -- --verbose
   ```

3. **运行单个测试**
   ```bash
   npm test -- --testNamePattern="应该成功让用户进入房间"
   ```

## 扩展测试

### 添加新测试
1. 在相应的测试文件中添加测试用例
2. 更新Mock数据（如需要）
3. 运行测试确保通过
4. 更新文档

### 性能测试
```javascript
// 性能测试示例
it('应该在合理时间内处理大量请求', async () => {
  const startTime = Date.now();
  
  // 执行测试操作
  
  const endTime = Date.now();
  expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
});
```

### 压力测试
```javascript
// 压力测试示例
it('应该处理并发用户', async () => {
  const promises = [];
  const userCount = 100;
  
  for (let i = 0; i < userCount; i++) {
    promises.push(BattleService.userEnterRoom(i, 1));
  }
  
  const results = await Promise.all(promises);
  expect(results).toHaveLength(userCount);
});
``` 
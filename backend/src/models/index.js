const { sequelize } = require('../config/database');

// 导入所有模型
const User = require('./User');
const Game = require('./Game');
const BattleRoom = require('./BattleRoom');
const BattleTable = require('./BattleTable');
const UserStatus = require('./UserStatus');
const Room = require('./Room');
const RoomPlayer = require('./RoomPlayer');

// 定义模型对象
const models = {
  User,
  Game,
  BattleRoom,
  BattleTable,
  UserStatus,
  Room,
  RoomPlayer
};

// 初始化模型关联
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
}; 
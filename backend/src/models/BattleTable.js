const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BattleTable = sequelize.define('BattleTable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  table_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '桌子ID: table_1, table_2, ..., table_50'
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '房间ID'
  },
  seat_1_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '座位1用户ID'
  },
  seat_2_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '座位2用户ID'
  },
  seat_3_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '座位3用户ID'
  },
  seat_4_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '座位4用户ID'
  },
  status: {
    type: DataTypes.ENUM('empty', 'waiting', 'playing', 'finished'),
    defaultValue: 'empty',
    comment: '桌子状态'
  },
  current_players: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前玩家数量'
  },
  max_players: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    comment: '最大玩家数量'
  },
  game_start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '游戏开始时间'
  },
  game_end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '游戏结束时间'
  }
}, {
  tableName: 'battle_tables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['table_id', 'room_id']
    }
  ]
});

// 定义模型关联
BattleTable.associate = (models) => {
  BattleTable.belongsTo(models.User, { as: 'seat1User', foreignKey: 'seat_1_user_id' });
  BattleTable.belongsTo(models.User, { as: 'seat2User', foreignKey: 'seat_2_user_id' });
  BattleTable.belongsTo(models.User, { as: 'seat3User', foreignKey: 'seat_3_user_id' });
  BattleTable.belongsTo(models.User, { as: 'seat4User', foreignKey: 'seat_4_user_id' });
  BattleTable.belongsTo(models.BattleRoom, { foreignKey: 'room_id' });
};

module.exports = BattleTable; 
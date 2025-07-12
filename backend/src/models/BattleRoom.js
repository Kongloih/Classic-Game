const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BattleRoom = sequelize.define('BattleRoom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  room_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '房间ID: room_1, room_2, room_3'
  },
  game_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '游戏ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '房间名称'
  },
  status: {
    type: DataTypes.ENUM('未满员', '满员'),
    defaultValue: '未满员',
    comment: '房间状态'
  },
  online_users: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前在线用户数量'
  },
  max_user: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
    comment: '房间最大容纳用户数量'
  },
  max_tables: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    comment: '最大桌子数量'
  },
  current_tables: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前桌子数量'
  }
}, {
  tableName: 'battle_rooms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['room_id', 'game_id']
    }
  ]
});

module.exports = BattleRoom; 
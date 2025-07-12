const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    comment: '房间ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '房间名称'
  },
  gameId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '游戏ID'
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '创建者ID'
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    comment: '最大玩家数'
  },
  currentPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前玩家数'
  },
  status: {
    type: DataTypes.ENUM('waiting', 'ready', 'playing', 'finished'),
    defaultValue: 'waiting',
    comment: '房间状态'
  },
  password: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '房间密码'
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '房间设置'
  },
  gameData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '游戏数据（分数、状态等）'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '游戏开始时间'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '游戏结束时间'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '创建时间'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '更新时间'
  }
}, {
  tableName: 'battle_rooms',
  timestamps: true,
  comment: '对战房间表'
});

module.exports = Room; 
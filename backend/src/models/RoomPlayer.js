const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RoomPlayer = sequelize.define('RoomPlayer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roomId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '房间ID'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户名'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL'
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '用户等级'
  },
  isReady: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否准备'
  },
  isHost: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否房主'
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '当前分数'
  },
  lines: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '消除行数'
  },
  gameResult: {
    type: DataTypes.ENUM('win', 'loss', 'draw'),
    allowNull: true,
    comment: '游戏结果'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '加入时间'
  },
  leftAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '离开时间'
  }
}, {
  tableName: 'room_players',
  timestamps: true,
  comment: '房间玩家表'
});

module.exports = RoomPlayer; 
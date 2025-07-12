const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserStatus = sequelize.define('UserStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '房间ID'
  },
  table_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '桌子ID'
  },
  seat_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '座位号: 1, 2, 3, 4'
  },
  status: {
    type: DataTypes.ENUM('idle', 'waiting', 'playing', 'spectating'),
    defaultValue: 'idle',
    comment: '用户状态'
  },
  last_activity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '最后活动时间'
  }
}, {
  tableName: 'user_status',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['last_activity']
    }
  ]
});

module.exports = UserStatus; 
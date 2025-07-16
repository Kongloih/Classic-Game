const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserStatusHistory = sequelize.define('UserStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
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
    allowNull: false,
    defaultValue: 'idle',
    comment: '用户状态'
  },
  action: {
    type: DataTypes.ENUM('enter_room', 'leave_room', 'join_table', 'leave_table', 'start_game', 'end_game', 'status_change'),
    allowNull: false,
    comment: '操作类型'
  },
  previous_status: {
    type: DataTypes.ENUM('idle', 'waiting', 'playing', 'spectating'),
    allowNull: true,
    comment: '之前的状态'
  },
  previous_room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '之前的房间ID'
  },
  previous_table_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '之前的桌子ID'
  },
  previous_seat_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '之前的座位号'
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '在之前状态停留的秒数'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '额外信息，如游戏ID、分数等'
  }
}, {
  tableName: 'user_status_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['room_id']
    },
    {
      fields: ['table_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['action']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['room_id', 'created_at']
    },
    {
      fields: ['table_id', 'created_at']
    }
  ]
});

// 定义关联关系
UserStatusHistory.associate = (models) => {
  // 与 User 的关联
  UserStatusHistory.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
  
  // 与 Room 的关联（如果存在）
  if (models.Room) {
    UserStatusHistory.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
  }
  
  // 与 BattleTable 的关联（如果存在）
  if (models.BattleTable) {
    UserStatusHistory.belongsTo(models.BattleTable, {
      foreignKey: 'table_id',
      as: 'table'
    });
  }
};

module.exports = UserStatusHistory; 
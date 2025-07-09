const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true // OAuth用户可能没有密码
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [1, 50]
    }
  },
  avatar: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    defaultValue: 'other'
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    defaultValue: null
  },
  phone: {
    type: DataTypes.STRING(20),
    defaultValue: null,
    validate: {
      is: /^[+]?[\d\s-()]+$/
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  last_login_at: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  last_login_ip: {
    type: DataTypes.STRING(45),
    defaultValue: null
  },
  login_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // OAuth相关字段
  oauth_providers: {
    type: DataTypes.JSON,
    defaultValue: null
  },
  google_id: {
    type: DataTypes.STRING(100),
    defaultValue: null
  },
  facebook_id: {
    type: DataTypes.STRING(100),
    defaultValue: null
  },
  // 游戏相关字段
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  coins: {
    type: DataTypes.INTEGER,
    defaultValue: 1000 // 新用户默认1000金币
  },
  diamonds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 游戏统计
  total_games: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_draws: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  highest_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_playtime: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 总游戏时长（秒）
  },
  // 社交相关
  friend_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 设置
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      language: 'zh-CN',
      theme: 'light',
      sound_enabled: true,
      music_enabled: true,
      notifications_enabled: true,
      friend_requests_enabled: true,
      show_online_status: true
    }
  },
  // 签到相关
  last_checkin_date: {
    type: DataTypes.DATEONLY,
    defaultValue: null
  },
  consecutive_checkin_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_checkin_days: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['username']
    },
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['status']
    },
    {
      fields: ['last_login_at']
    },
    {
      fields: ['level']
    },
    {
      fields: ['google_id']
    },
    {
      fields: ['facebook_id']
    }
  ]
});

// 密码哈希处理
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password') && user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// 实例方法
User.prototype.checkPassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.verification_token;
  delete values.reset_password_token;
  delete values.reset_password_expires;
  return values;
};

User.prototype.getWinRate = function() {
  if (this.total_games === 0) return 0;
  return Math.round((this.total_wins / this.total_games) * 100);
};

User.prototype.updateLoginInfo = async function(ip) {
  this.last_login_at = new Date();
  this.last_login_ip = ip;
  this.login_count += 1;
  await this.save();
};

User.prototype.addExperience = async function(exp) {
  this.experience += exp;
  
  // 检查是否升级
  const expNeeded = this.level * 100; // 每级需要 level * 100 经验
  if (this.experience >= expNeeded) {
    this.level += 1;
    this.experience -= expNeeded;
    this.coins += this.level * 50; // 升级奖励金币
  }
  
  await this.save();
  return this.level;
};

User.prototype.updateGameStats = async function(result, score = 0) {
  this.total_games += 1;
  
  switch (result) {
    case 'win':
      this.total_wins += 1;
      await this.addExperience(50);
      this.coins += 10;
      break;
    case 'loss':
      this.total_losses += 1;
      await this.addExperience(10);
      break;
    case 'draw':
      this.total_draws += 1;
      await this.addExperience(25);
      this.coins += 5;
      break;
  }
  
  if (score > this.highest_score) {
    this.highest_score = score;
  }
  
  await this.save();
};

User.prototype.dailyCheckin = async function() {
  const today = new Date().toISOString().split('T')[0];
  const lastCheckin = this.last_checkin_date;
  
  if (lastCheckin === today) {
    return { success: false, message: '今天已经签到过了' };
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // 检查是否连续签到
  if (lastCheckin === yesterdayStr) {
    this.consecutive_checkin_days += 1;
  } else {
    this.consecutive_checkin_days = 1;
  }
  
  this.last_checkin_date = today;
  this.total_checkin_days += 1;
  
  // 签到奖励
  const baseReward = 20;
  const bonusReward = Math.min(this.consecutive_checkin_days * 5, 100);
  const totalReward = baseReward + bonusReward;
  
  this.coins += totalReward;
  await this.addExperience(20);
  
  await this.save();
  
  return {
    success: true,
    reward: totalReward,
    consecutive_days: this.consecutive_checkin_days
  };
};

// 类方法
User.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    where: {
      [sequelize.Sequelize.Op.or]: [
        { email: identifier },
        { username: identifier }
      ]
    }
  });
};

User.findActiveUsers = function(limit = 10) {
  return this.findAll({
    where: { status: 'active' },
    order: [['last_login_at', 'DESC']],
    limit
  });
};

User.getLeaderboard = function(type = 'level', limit = 50) {
  const orderField = type === 'wins' ? 'total_wins' : 
                     type === 'score' ? 'highest_score' : 'level';
  
  return this.findAll({
    where: { status: 'active' },
    order: [[orderField, 'DESC']],
    limit,
    attributes: [
      'id', 'username', 'nickname', 'avatar', 'level', 
      'total_wins', 'total_games', 'highest_score'
    ]
  });
};

module.exports = User; 
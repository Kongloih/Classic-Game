const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  name_jp: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'fighting',     // 格斗类
      'action',       // 动作类
      'shooting',     // 射击类
      'puzzle',       // 益智类
      'racing',       // 赛车类
      'sports',       // 体育类
      'platform',     // 平台跳跃类
      'arcade',       // 街机类
      'strategy',     // 策略类
      'rpg'          // 角色扮演类
    ),
    allowNull: false
  },
  developer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  release_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1970,
      max: new Date().getFullYear()
    }
  },
  // 游戏资源
  thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  screenshots: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  game_file_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  rom_file_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // 游戏配置
  controls: {
    type: DataTypes.JSON,
    defaultValue: {
      player1: {
        up: 'ArrowUp',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        button1: 'Space',
        button2: 'KeyZ',
        button3: 'KeyX',
        button4: 'KeyC',
        button5: 'KeyV',
        button6: 'KeyB'
      },
      player2: {
        up: 'KeyW',
        down: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
        button1: 'KeyQ',
        button2: 'KeyE',
        button3: 'KeyR',
        button4: 'KeyT',
        button5: 'KeyY',
        button6: 'KeyU'
      }
    }
  },
  max_players: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 4
    }
  },
  supports_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  supports_ai: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  difficulty_levels: {
    type: DataTypes.JSON,
    defaultValue: ['easy', 'normal', 'hard']
  },
  // 游戏统计
  total_plays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_players: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // 游戏状态
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'deprecated'),
    defaultValue: 'active'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_hot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // 游戏设置
  file_size: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 文件大小（字节）
  },
  min_age: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // 最低年龄限制
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  // 技术信息
  emulator_type: {
    type: DataTypes.STRING(50),
    allowNull: true // 如 'mame', 'fba', 'nes', 'snes' 等
  },
  original_resolution: {
    type: DataTypes.STRING(20),
    allowNull: true // 如 '320x240'
  },
  frame_rate: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  // 排序权重
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'games',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_new']
    },
    {
      fields: ['is_hot']
    },
    {
      fields: ['total_plays']
    },
    {
      fields: ['average_rating']
    },
    {
      fields: ['release_year']
    },
    {
      fields: ['sort_order']
    }
  ]
});

// 实例方法
Game.prototype.incrementPlayCount = async function() {
  this.total_plays += 1;
  await this.save();
};

Game.prototype.addRating = async function(rating) {
  const currentTotal = this.average_rating * this.rating_count;
  this.rating_count += 1;
  this.average_rating = ((currentTotal + rating) / this.rating_count).toFixed(2);
  await this.save();
  return this.average_rating;
};

Game.prototype.addToFavorites = async function() {
  this.favorite_count += 1;
  await this.save();
};

Game.prototype.removeFromFavorites = async function() {
  this.favorite_count = Math.max(0, this.favorite_count - 1);
  await this.save();
};

Game.prototype.toJSON = function() {
  const values = { ...this.get() };
  // 添加计算字段
  values.popularity_score = this.calculatePopularityScore();
  return values;
};

Game.prototype.calculatePopularityScore = function() {
  // 综合热度评分算法
  const playWeight = 0.4;
  const ratingWeight = 0.3;
  const favoriteWeight = 0.3;
  
  const normalizedPlays = Math.min(this.total_plays / 1000, 1); // 1000次为满分
  const normalizedRating = this.average_rating / 5; // 5星为满分
  const normalizedFavorites = Math.min(this.favorite_count / 100, 1); // 100收藏为满分
  
  return (
    normalizedPlays * playWeight +
    normalizedRating * ratingWeight +
    normalizedFavorites * favoriteWeight
  ).toFixed(3);
};

// 类方法
Game.findByCategory = function(category, limit = 20) {
  return this.findAll({
    where: { 
      category,
      status: 'active'
    },
    order: [['sort_order', 'ASC'], ['total_plays', 'DESC']],
    limit
  });
};

Game.getFeaturedGames = function(limit = 10) {
  return this.findAll({
    where: { 
      is_featured: true,
      status: 'active'
    },
    order: [['sort_order', 'ASC']],
    limit
  });
};

Game.getPopularGames = function(limit = 20) {
  return this.findAll({
    where: { status: 'active' },
    order: [['total_plays', 'DESC'], ['average_rating', 'DESC']],
    limit
  });
};

Game.getNewGames = function(limit = 10) {
  return this.findAll({
    where: { 
      is_new: true,
      status: 'active'
    },
    order: [['created_at', 'DESC']],
    limit
  });
};

Game.getHotGames = function(limit = 15) {
  return this.findAll({
    where: { 
      is_hot: true,
      status: 'active'
    },
    order: [['total_plays', 'DESC']],
    limit
  });
};

Game.searchGames = function(query, limit = 50) {
  const { Op } = require('sequelize');
  
  return this.findAll({
    where: {
      status: 'active',
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { name_en: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { developer: { [Op.like]: `%${query}%` } }
      ]
    },
    order: [['total_plays', 'DESC']],
    limit
  });
};

Game.getGamesByYear = function(year, limit = 30) {
  return this.findAll({
    where: { 
      release_year: year,
      status: 'active'
    },
    order: [['total_plays', 'DESC']],
    limit
  });
};

Game.getRandomGames = function(limit = 10) {
  return this.findAll({
    where: { status: 'active' },
    order: sequelize.random(),
    limit
  });
};

Game.getTopRatedGames = function(limit = 20) {
  return this.findAll({
    where: { 
      status: 'active',
      rating_count: { [sequelize.Sequelize.Op.gte]: 5 } // 至少5个评分
    },
    order: [['average_rating', 'DESC'], ['rating_count', 'DESC']],
    limit
  });
};

module.exports = Game; 
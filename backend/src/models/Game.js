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
    comment: '游戏名称'
  },
  name_en: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '英文名称'
  },
  name_jp: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '日文名称'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '游戏描述'
  },
  category: {
    type: DataTypes.ENUM('fighting', 'action', 'shooting', 'puzzle', 'racing', 'sports', 'platform', 'arcade', 'strategy', 'rpg'),
    allowNull: false,
    comment: '游戏分类'
  },
  developer: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '开发商'
  },
  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '发行商'
  },
  release_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '发行年份'
  },
  thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '缩略图'
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '封面图'
  },
  screenshots: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '游戏截图'
  },
  game_file_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '游戏文件URL'
  },
  rom_file_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ROM文件名'
  },
  controls: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '按键配置'
  },
  max_players: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '最大玩家数'
  },
  max_seat: {
    type: DataTypes.INTEGER,
    defaultValue: 4,
    comment: '游戏最大座位数量（如俄罗斯方块为2，贪吃蛇为1等）'
  },
  available_seats: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '可用座位配置，如[2,4]表示座位2和4可用'
  },
  supports_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否支持在线对战'
  },
  supports_ai: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否支持AI对战'
  },
  difficulty_levels: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '难度等级'
  },
  total_plays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总游戏次数'
  },
  total_players: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '总玩家数'
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    comment: '平均评分'
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '评分次数'
  },
  favorite_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏次数'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'deprecated'),
    defaultValue: 'active',
    comment: '游戏状态'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否推荐'
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否新游戏'
  },
  is_hot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否热门'
  },
  file_size: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '文件大小（字节）'
  },
  min_age: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '最低年龄限制'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '游戏标签'
  },
  emulator_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '模拟器类型'
  },
  original_resolution: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '原始分辨率'
  },
  frame_rate: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: '帧率'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序权重'
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
Game.getFeaturedGames = function(limit = 10) {
  return this.findAll({
    where: { 
      status: 'active',
      is_featured: true 
    },
    order: [['sort_order', 'DESC'], ['total_plays', 'DESC']],
    limit
  });
};

Game.getNewGames = function(limit = 10) {
  return this.findAll({
    where: { 
      status: 'active',
      is_new: true 
    },
    order: [['created_at', 'DESC']],
    limit
  });
};

Game.getHotGames = function(limit = 10) {
  return this.findAll({
    where: { 
      status: 'active',
      is_hot: true 
    },
    order: [['total_plays', 'DESC']],
    limit
  });
};

Game.getGamesByCategory = function(category, limit = 20) {
  return this.findAll({
    where: { 
      status: 'active',
      category 
    },
    order: [['total_plays', 'DESC']],
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
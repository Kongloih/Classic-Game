module.exports = {
  // 测试环境
  testEnvironment: 'node',
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'json'],
  
  // 模块名称映射
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@socket/(.*)$': '<rootDir>/src/socket/$1',
  },
  
  // 转换器
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  // 转换忽略
  transformIgnorePatterns: [
    '/node_modules/(?!(socket.io|socket.io-client)/)',
  ],
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.{test,spec}.js',
  ],
  
  // 覆盖率收集
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.js',
    '!src/server.js',
    '!src/setupTests.js',
    '!src/config/database.js',
    '!src/config/redis.js',
    '!src/scripts/**',
  ],
  
  // 覆盖率目录
  coverageDirectory: 'coverage',
  
  // 覆盖率报告器
  coverageReporters: ['text', 'lcov', 'html'],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // 测试超时时间
  testTimeout: 10000,
  
  // 清除模拟
  clearMocks: true,
  
  // 收集覆盖率时忽略的文件
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/build/',
    '/dist/',
    '/uploads/',
    '/logs/',
  ],
  
  // 模块路径
  modulePaths: ['<rootDir>/src'],
  
  // 测试环境变量
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // 全局设置
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  
  // 测试设置
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/build/',
    '/dist/',
  ],
}; 
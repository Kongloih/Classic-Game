module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // 模块文件扩展名
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  
  // 模块名称映射
  moduleNameMapping: {
    // 样式文件模拟
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
    
    // 路径别名
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  
  // 转换器
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // 转换忽略
  transformIgnorePatterns: [
    '/node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  
  // 覆盖率收集
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!src/setupTests.js',
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
    '/public/',
  ],
  
  // 模块路径
  modulePaths: ['<rootDir>/src'],
  
  // 测试环境变量
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  
  // 全局设置
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
}; 
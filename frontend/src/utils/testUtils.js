import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';

// 导入所有reducers
import authReducer from '../store/slices/authSlice';
import gameReducer from '../store/slices/gameSlice';
import battleReducer from '../store/slices/battleSlice';
import leaderboardReducer from '../store/slices/leaderboardSlice';
import socialReducer from '../store/slices/socialSlice';
import socketReducer from '../store/slices/socketSlice';
import uiReducer from '../store/slices/uiSlice';

// 创建测试主题
const testTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// 创建测试store
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      game: gameReducer,
      battle: battleReducer,
      leaderboard: leaderboardReducer,
      social: socialReducer,
      socket: socketReducer,
      ui: uiReducer,
    },
    preloadedState,
  });
};

// 自定义渲染函数
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={testTheme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// 模拟用户数据
export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  avatar: 'https://via.placeholder.com/150',
  level: 10,
  experience: 1000,
  coins: 500,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
};

// 模拟游戏数据
export const mockGame = {
  id: 1,
  title: '俄罗斯方块',
  description: '经典的俄罗斯方块游戏',
  image: '/images/tetris.jpg',
  players: '1-2人',
  difficulty: '中等',
  category: '益智',
  rating: 4.8,
  playCount: 15420,
  onlinePlayers: 234,
};

// 模拟游戏房间数据
export const mockGameRoom = {
  id: 'room_1',
  gameId: 1,
  gameName: '俄罗斯方块',
  players: [
    { id: 1, username: 'player1', ready: true },
    { id: 2, username: 'player2', ready: false },
  ],
  maxPlayers: 2,
  status: 'waiting',
  createdAt: '2023-01-01T00:00:00.000Z',
};

// 模拟分数数据
export const mockScore = {
  id: 1,
  userId: 1,
  gameId: 1,
  score: 1000,
  level: 5,
  time: 120,
  createdAt: '2023-01-01T00:00:00.000Z',
};

// 模拟排行榜数据
export const mockLeaderboard = [
  { id: 1, username: 'player1', score: 1000, rank: 1 },
  { id: 2, username: 'player2', score: 900, rank: 2 },
  { id: 3, username: 'player3', score: 800, rank: 3 },
];

// 模拟好友数据
export const mockFriend = {
  id: 2,
  username: 'friend1',
  avatar: 'https://via.placeholder.com/150',
  status: 'online',
  level: 8,
  lastSeen: '2023-01-01T00:00:00.000Z',
};

// 模拟公会数据
export const mockGuild = {
  id: 1,
  name: '测试公会',
  description: '这是一个测试公会',
  avatar: 'https://via.placeholder.com/150',
  level: 5,
  memberCount: 10,
  maxMembers: 50,
  leader: { id: 1, username: 'leader' },
  members: [
    { id: 1, username: 'leader', role: 'leader' },
    { id: 2, username: 'member1', role: 'member' },
  ],
};

// 模拟API响应
export const mockApiResponse = (data, status = 200) => {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {},
  };
};

// 模拟错误响应
export const mockApiError = (message = 'API Error', status = 500) => {
  return {
    response: {
      data: { message },
      status,
      statusText: 'Error',
    },
  };
};

// 等待异步操作完成
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟事件
export const mockEvent = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {
    value: '',
    checked: false,
  },
};

// 模拟键盘事件
export const mockKeyEvent = (key, options = {}) => ({
  key,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...options,
});

// 模拟鼠标事件
export const mockMouseEvent = (options = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  clientX: 0,
  clientY: 0,
  ...options,
});

// 模拟文件上传事件
export const mockFileUploadEvent = (files = []) => ({
  target: {
    files,
  },
  preventDefault: jest.fn(),
});

// 模拟FormData
export const mockFormData = () => {
  const formData = new FormData();
  formData.append = jest.fn();
  formData.get = jest.fn();
  formData.getAll = jest.fn();
  formData.has = jest.fn();
  formData.delete = jest.fn();
  return formData;
};

// 清理函数
export const cleanup = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
}; 
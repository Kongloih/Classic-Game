import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import gameSlice from './slices/gameSlice';
import socketSlice from './slices/socketSlice';
import battleSlice from './slices/battleSlice';
import socialSlice from './slices/socialSlice';
import leaderboardSlice from './slices/leaderboardSlice';

// 持久化配置
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'ui'], // 只持久化认证和UI状态
  blacklist: ['socket', 'battle'], // 不持久化实时数据
};

// 合并reducers
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  game: gameSlice,
  socket: socketSlice,
  battle: battleSlice,
  social: socialSlice,
  leaderboard: leaderboardSlice,
});

// 创建持久化reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
          // Socket相关actions可能包含非序列化数据
          'socket/updateConnection',
          'socket/updateUserList',
          'battle/updateRoomState',
        ],
        ignoredPaths: ['socket.instance', 'battle.gameInstance'],
      },
      immutableCheck: {
        ignoredPaths: ['socket.instance', 'battle.gameInstance'],
      },
    }).concat(
      // 在开发环境添加Redux DevTools
      process.env.NODE_ENV === 'development' ? [] : []
    ),
  devTools: process.env.NODE_ENV === 'development',
});

// 创建persistor
export const persistor = persistStore(store);

// TypeScript支持 - 在JS文件中作为注释保留
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store; 
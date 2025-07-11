import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Fade } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

// 组件导入
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// 页面组件导入
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import GameHallPage from './pages/games/GameHallPage';
import GameSelectionPage from './pages/games/GameSelectionPage';
import GameDetailPage from './pages/games/GameDetailPage';
import GamePlayPage from './pages/games/GamePlayPage';
import ProfilePage from './pages/user/ProfilePage';
import SettingsPage from './pages/user/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import FriendsPage from './pages/social/FriendsPage';
import GuildPage from './pages/social/GuildPage';
import BattlePage from './pages/battle/BattlePage';
import BattleRoomPage from './pages/battle/BattleRoomPage';
import TetrisTestPage from './pages/test/TetrisTestPage';
import GameTestPage from './pages/test/GameTestPage';
import SimpleGameTestPage from './pages/test/SimpleGameTestPage';
import NotFoundPage from './pages/NotFoundPage';

// Redux actions
import { checkAuthStatus, clearUser } from './store/slices/authSlice';
import { initializeSocket, disconnectSocket } from './store/slices/socketSlice';

// 服务
import { socketService } from './services/socketService';

// 样式
import './styles/App.css';

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading: authLoading } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 检查认证状态
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        console.log('初始化应用 - 未找到认证token，这是正常的');
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, [dispatch]);

  // Socket连接管理
  useEffect(() => {
    if (isAuthenticated && user) {
      // 用户已登录，初始化Socket连接
      dispatch(initializeSocket());
      
      // 监听连接状态
      socketService.on('connect', () => {
        console.log('✅ Socket连接成功');
      });

      socketService.on('disconnect', (reason) => {
        console.log('🔌 Socket连接断开:', reason);
        if (reason === 'io server disconnect') {
          // 服务器主动断开，尝试重连
          socketService.connect();
        }
      });

      socketService.on('auth_error', () => {
        console.error('❌ Socket认证失败，清除用户状态');
        dispatch(clearUser());
      });

    } else {
      // 用户未登录，断开Socket连接
      dispatch(disconnectSocket());
    }

    // 清理函数
    return () => {
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('auth_error');
    };
  }, [isAuthenticated, user, dispatch]);

  // 侧边栏切换
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 应用加载中
  if (appLoading || authLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <LoadingSpinner message="正在加载应用..." />
      </Box>
    );
  }

  return (
    <Box 
      className={`app ${theme}`}
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}
    >
      {/* 头部导航 */}
      <Header 
        onSidebarToggle={handleSidebarToggle}
        sidebarOpen={sidebarOpen}
      />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* 侧边栏 */}
        {isAuthenticated && (
          <Sidebar 
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* 主内容区域 */}
        <Box 
          component="main"
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginLeft: isAuthenticated && sidebarOpen ? { sm: '240px' } : 0,
            transition: theme => theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <AnimatePresence mode="wait">
            <Fade in timeout={300}>
              <Box sx={{ flex: 1, p: { xs: 1, sm: 2, md: 3 } }}>
                <Routes>
                  {/* 公开路由 */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                  } />
                  <Route path="/register" element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
                  } />
                  
                  {/* 游戏相关路由 */}
                  <Route path="/games" element={<GameSelectionPage />} />
                  <Route path="/games/:gameId" element={<GameDetailPage />} />
                  <Route path="/games/:gameId/hall" element={<GameHallPage />} />
                  <Route path="/play/:gameId" element={
                    <ProtectedRoute>
                      <GamePlayPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 用户相关路由 */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 社交功能路由 */}
                  <Route path="/friends" element={
                    <ProtectedRoute>
                      <FriendsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/guild" element={
                    <ProtectedRoute>
                      <GuildPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 对战相关路由 */}
                  <Route path="/battle" element={
                    <ProtectedRoute>
                      <BattlePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/battle/room/:gameId/:roomId" element={
                    <ProtectedRoute>
                      <BattleRoomPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 测试路由 */}
                  <Route path="/test/tetris" element={<TetrisTestPage />} />
                  <Route path="/test/games" element={<GameTestPage />} />
                  <Route path="/test/simple" element={<SimpleGameTestPage />} />
                  
                  {/* 排行榜 */}
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  
                  {/* 重定向 */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Navigate to="/games" replace />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404页面 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Box>
            </Fade>
          </AnimatePresence>
        </Box>
      </Box>

      {/* 底部 */}
      <Footer />
    </Box>
  );
}

export default App; 
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { store, persistor } from './store/store';
import theme from './theme/theme';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

import './styles/index.css';

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
    },
    mutations: {
      retry: 1,
    },
  },
});

// 性能监控
if (process.env.NODE_ENV === 'production') {
  // 可以在这里集成性能监控服务，如 Sentry
  console.log('🚀 经典街机游戏平台已启动');
}

// 全局错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
  // 在生产环境中，可以将错误发送到监控服务
});

window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error);
  // 在生产环境中，可以将错误发送到监控服务
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <Provider store={store}>
          <PersistGate 
            loading={<LoadingSpinner message="正在初始化应用..." />} 
            persistor={persistor}
          >
            <QueryClientProvider client={queryClient}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                  }}
                >
                  <App />
                  
                  {/* Toast 通知 */}
                  <Toaster
                    position="top-right"
                    reverseOrder={false}
                    gutter={8}
                    containerClassName=""
                    containerStyle={{}}
                    toastOptions={{
                      // 默认配置
                      className: '',
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                        fontFamily: 'Noto Sans SC, sans-serif',
                      },
                      // 成功通知样式
                      success: {
                        duration: 3000,
                        style: {
                          background: '#4caf50',
                        },
                        iconTheme: {
                          primary: '#fff',
                          secondary: '#4caf50',
                        },
                      },
                      // 错误通知样式
                      error: {
                        duration: 5000,
                        style: {
                          background: '#f44336',
                        },
                        iconTheme: {
                          primary: '#fff',
                          secondary: '#f44336',
                        },
                      },
                      // 加载中通知样式
                      loading: {
                        duration: Infinity,
                        style: {
                          background: '#2196f3',
                        },
                      },
                    }}
                  />
                  
                  {/* React Query 开发工具 - 仅在开发环境显示 */}
                  {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools 
                      initialIsOpen={false} 
                      position="bottom-right"
                    />
                  )}
                </BrowserRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// PWA 支持
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW 注册成功: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW 注册失败: ', registrationError);
      });
  });
}

// 开发环境热重载支持
if (module.hot && process.env.NODE_ENV === 'development') {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <HelmetProvider>
            <Provider store={store}>
              <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
                <QueryClientProvider client={queryClient}>
                  <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter
                      future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true
                      }}
                    >
                      <NextApp />
                    </BrowserRouter>
                  </ThemeProvider>
                </QueryClientProvider>
              </PersistGate>
            </Provider>
          </HelmetProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  });
} 
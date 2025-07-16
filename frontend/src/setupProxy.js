const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug',
      pathRewrite: {
        '^/api': '/api' // 显式保留 /api 前缀
      },
      onError: (err, req, res) => {
        console.error('代理错误:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ 
          success: false, 
          message: '后端服务不可用，请检查后端服务器是否运行' 
        }));
      }
    })
  );

  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug'
    })
  );
}; 
const { createProxyMiddleware } = require('http-proxy-middleware');

console.log('✅ 代理开始');

module.exports = function(app) {
  // 修改后的 setupproxy.js
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log(`[PROXY] ${req.method} ${req.path} -> ${proxyReq.path}`);
      },
      pathRewrite: {
        '^/api': '/api'
      },
      onError: (err, req, res) => {
        console.log('✅ 代理错误：', err);
        console.error(`[PROXY ERROR] ${req.method} ${req.path}: ${err.message}`);
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
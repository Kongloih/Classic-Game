// src/server.js
const app = require('./app'); // 引入app.js导出的实例
const PORT = process.env.PORT || 3000;

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
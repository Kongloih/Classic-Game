@echo off
echo 🎮 启动多用户测试环境
echo.

echo 📋 步骤1: 创建测试用户...
cd backend
node scripts/create-test-users.js
echo.

echo 📋 步骤2: 启动后端服务器...
start "Backend Server" cmd /k "npm run dev"
echo.

echo 📋 步骤3: 等待后端启动...
timeout /t 5 /nobreak >nul
echo.

echo 📋 步骤4: 启动前端应用...
cd ../frontend
start "Frontend App" cmd /k "npm start"
echo.

echo ✅ 多用户测试环境启动完成！
echo.
echo 🎯 测试说明：
echo 1. 后端服务器运行在: http://localhost:5000
echo 2. 前端应用运行在: http://localhost:3000
echo 3. 测试用户信息：
echo    - 用户1: player1@test.com / password123
echo    - 用户2: player2@test.com / password123
echo.
echo 🔄 测试步骤：
echo 1. 在浏览器中打开 http://localhost:3000
echo 2. 使用用户1登录
echo 3. 在另一个浏览器或隐私窗口中打开 http://localhost:3000
echo 4. 使用用户2登录
echo 5. 两个用户进入同一个游戏房间进行测试
echo.
pause 
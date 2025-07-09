@echo off
echo ========================================
echo    经典街机游戏平台 - 本地开发环境
echo ========================================
echo.

echo 正在检查Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js已安装

echo.
echo 正在安装项目依赖...

echo 1. 安装后端依赖...
cd backend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)

echo 2. 安装前端依赖...
cd ..\frontend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)

cd ..

echo.
echo ✅ 依赖安装完成！

echo.
echo 🚀 启动开发服务器...

echo 启动后端服务...
start "后端服务" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 启动前端服务...
start "前端服务" cmd /k "cd frontend && npm start"

echo.
echo ✅ 服务启动成功！
echo.
echo 🎮 前端应用: http://localhost:3000
echo 🔧 后端API:  http://localhost:5000
echo.
echo 注意：首次启动可能需要配置数据库连接
echo 请查看控制台输出了解详细状态
echo.
pause 
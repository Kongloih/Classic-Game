@echo off
echo 🔧 修复前端依赖问题...
echo.

echo 1️⃣ 清理旧的依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo ✅ 清理完成

echo.
echo 2️⃣ 安装所有依赖...
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo 3️⃣ 启动前端应用...
echo 🚀 正在启动 React 开发服务器...
npm start

pause 
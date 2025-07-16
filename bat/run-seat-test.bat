@echo off
echo 正在运行座位切换测试...
echo.

cd /d "%~dp0"

echo 检查Node.js是否安装...
node --version
if errorlevel 1 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo.
echo 检查socket.io-client是否安装...
node -e "try { require('socket.io-client'); console.log('✅ socket.io-client已安装'); } catch(e) { console.log('❌ socket.io-client未安装，正在安装...'); require('child_process').execSync('npm install socket.io-client', {stdio: 'inherit'}); }"

echo.
echo 开始运行座位切换测试...
node test-seat-switching.js

echo.
echo 测试完成，按任意键退出...
pause 
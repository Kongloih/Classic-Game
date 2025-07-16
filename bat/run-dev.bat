@echo off
echo ========================================
echo    经典街机游戏平台 - 开发环境启动
echo ========================================
echo.

echo 正在检查Docker状态...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Docker，请先安装Docker Desktop
    echo 下载地址：https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker已安装

echo.
echo 正在启动服务，请稍等...
echo 首次启动需要下载镜像，可能需要几分钟时间
echo.

docker-compose -p arcade-platform-dev -f docker-compose.dev.yml up -d --build

if %errorlevel% neq 0 (
    echo ❌ 启动失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo ✅ 服务启动成功！
echo.
echo 🎮 前端应用: http://localhost:3000
echo 🔧 后端API:  http://localhost:5000
echo 📚 API文档:  http://localhost:5000/api-docs
echo 🗄️ 数据库:   localhost:3306 (用户: arcade_user, 密码: arcade_pass)
echo 📦 Redis:   localhost:6379 (密码: redis123456)
echo.
echo 默认管理员账户:
echo 用户名: admin
echo 密码: admin123456
echo.
echo 按任意键查看服务状态...
pause >nul

docker-compose -p arcade-platform-dev -f docker-compose.dev.yml ps

echo.
echo 使用以下命令管理服务：
echo   查看日志: docker-compose -p arcade-platform-dev -f docker-compose.dev.yml logs -f
echo   停止服务: docker-compose -p arcade-platform-dev -f docker-compose.dev.yml down
echo   重启服务: docker-compose -p arcade-platform-dev -f docker-compose.dev.yml restart
echo.
pause 
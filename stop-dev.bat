@echo off
echo ========================================
echo    停止经典街机游戏平台开发环境
echo ========================================
echo.

echo 正在停止所有服务...
docker-compose -p arcade-platform-dev -f docker-compose.dev.yml down

if %errorlevel% neq 0 (
    echo ❌ 停止服务时出现错误
    pause
    exit /b 1
)

echo ✅ 所有服务已停止
echo.

echo 是否要清理数据？(输入 y 清理数据库和缓存数据)
set /p cleanup=清理数据 (y/N): 

if /i "%cleanup%"=="y" (
    echo 正在清理数据...
    docker-compose -p arcade-platform-dev -f docker-compose.dev.yml down -v
    docker system prune -f
    echo ✅ 数据清理完成
) else (
    echo 数据已保留，下次启动时数据仍然存在
)

echo.
pause 
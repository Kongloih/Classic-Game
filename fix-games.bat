@echo off
echo 正在修复游戏数据...
echo.

REM 检查MySQL是否运行
echo 检查MySQL连接...
mysql -u root -p -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 无法连接到MySQL，请确保MySQL服务正在运行
    echo 请先启动MySQL服务，然后重新运行此脚本
    pause
    exit /b 1
)

echo MySQL连接成功！

REM 执行修复脚本
echo 执行游戏数据修复脚本...
mysql -u root -p < database/fix-games.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ 游戏数据修复成功！
    echo.
    echo 已添加以下游戏：
    echo - 俄罗斯方块 (ID: 1)
    echo - 贪吃蛇 (ID: 2)  
    echo - 打砖块 (ID: 3)
    echo - 拳皇97 (ID: 4)
    echo - 街头霸王2 (ID: 5)
    echo - 其他经典游戏...
    echo.
    echo 现在可以重新测试游戏功能了！
) else (
    echo.
    echo ❌ 游戏数据修复失败！
    echo 请检查MySQL连接和权限设置
)

pause 
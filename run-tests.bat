@echo off
echo ========================================
echo 经典游戏平台 - 测试运行脚本
echo ========================================
echo.

:menu
echo 请选择要运行的测试:
echo 1. 前端测试
echo 2. 后端测试
echo 3. 前端测试 (带覆盖率)
echo 4. 后端测试 (带覆盖率)
echo 5. 所有测试
echo 6. 退出
echo.
set /p choice=请输入选择 (1-6): 

if "%choice%"=="1" goto frontend_test
if "%choice%"=="2" goto backend_test
if "%choice%"=="3" goto frontend_coverage
if "%choice%"=="4" goto backend_coverage
if "%choice%"=="5" goto all_tests
if "%choice%"=="6" goto exit
echo 无效选择，请重新输入
goto menu

:frontend_test
echo.
echo 运行前端测试...
cd frontend
if not exist node_modules (
    echo 安装前端依赖...
    npm install
)
echo 开始前端测试...
npm test -- --watchAll=false
cd ..
echo.
echo 前端测试完成！
pause
goto menu

:backend_test
echo.
echo 运行后端测试...
cd backend
if not exist node_modules (
    echo 安装后端依赖...
    npm install
)
echo 开始后端测试...
npm test -- --watchAll=false
cd ..
echo.
echo 后端测试完成！
pause
goto menu

:frontend_coverage
echo.
echo 运行前端测试 (带覆盖率)...
cd frontend
if not exist node_modules (
    echo 安装前端依赖...
    npm install
)
echo 开始前端测试 (带覆盖率)...
npm test -- --coverage --watchAll=false
cd ..
echo.
echo 前端测试 (带覆盖率) 完成！
pause
goto menu

:backend_coverage
echo.
echo 运行后端测试 (带覆盖率)...
cd backend
if not exist node_modules (
    echo 安装后端依赖...
    npm install
)
echo 开始后端测试 (带覆盖率)...
npm test -- --coverage --watchAll=false
cd ..
echo.
echo 后端测试 (带覆盖率) 完成！
pause
goto menu

:all_tests
echo.
echo 运行所有测试...
echo.

echo 1. 运行前端测试...
cd frontend
if not exist node_modules (
    echo 安装前端依赖...
    npm install
)
npm test -- --coverage --watchAll=false
cd ..

echo.
echo 2. 运行后端测试...
cd backend
if not exist node_modules (
    echo 安装后端依赖...
    npm install
)
npm test -- --coverage --watchAll=false
cd ..

echo.
echo 所有测试完成！
pause
goto menu

:exit
echo.
echo 感谢使用测试脚本！
pause
exit 
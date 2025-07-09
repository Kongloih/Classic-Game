@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM 经典街机游戏平台生产环境部署脚本 (Windows版本)
REM 使用方法: deploy.bat [start|stop|restart|logs|status]

set PROJECT_NAME=arcade-platform
set COMPOSE_FILE=docker-compose.prod.yml

REM 颜色定义
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM 日志函数
:log_info
echo %BLUE%[INFO]%NC% %~1
goto :eof

:log_success
echo %GREEN%[SUCCESS]%NC% %~1
goto :eof

:log_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:log_error
echo %RED%[ERROR]%NC% %~1
goto :eof

REM 检查Docker和Docker Compose
:check_prerequisites
call :log_info "检查系统环境..."

docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker未安装，请先安装Docker Desktop"
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker Compose未安装，请先安装Docker Compose"
    exit /b 1
)

call :log_success "系统环境检查通过"
goto :eof

REM 检查环境变量文件
:check_env_file
if not exist ".env" (
    call :log_warning "未找到.env文件，正在从模板创建..."
    if exist "env.production.template" (
        copy env.production.template .env >nul
        call :log_warning "请编辑.env文件，设置正确的环境变量"
        call :log_warning "特别是数据库密码、JWT密钥等敏感信息"
        exit /b 1
    ) else (
        call :log_error "未找到环境变量模板文件"
        exit /b 1
    )
)
goto :eof

REM 构建镜像
:build_images
call :log_info "构建Docker镜像..."
docker-compose -f %COMPOSE_FILE% build --no-cache
if errorlevel 1 (
    call :log_error "镜像构建失败"
    exit /b 1
)
call :log_success "镜像构建完成"
goto :eof

REM 启动服务
:start_services
call :log_info "启动服务..."
docker-compose -f %COMPOSE_FILE% up -d
if errorlevel 1 (
    call :log_error "服务启动失败"
    exit /b 1
)

call :log_info "等待服务启动..."
timeout /t 30 /nobreak >nul

REM 检查服务状态
call :check_services_health
goto :eof

REM 停止服务
:stop_services
call :log_info "停止服务..."
docker-compose -f %COMPOSE_FILE% down
call :log_success "服务已停止"
goto :eof

REM 重启服务
:restart_services
call :log_info "重启服务..."
docker-compose -f %COMPOSE_FILE% down
docker-compose -f %COMPOSE_FILE% up -d

call :log_info "等待服务启动..."
timeout /t 30 /nobreak >nul

REM 检查服务状态
call :check_services_health
goto :eof

REM 检查服务健康状态
:check_services_health
call :log_info "检查服务健康状态..."

set services=mysql redis backend frontend
for %%s in (%services%) do (
    set container_name=%PROJECT_NAME%_%%s_prod
    docker ps | findstr /i "!container_name!" >nul
    if errorlevel 1 (
        call :log_error "%%s 服务未运行"
    ) else (
        call :log_success "%%s 服务运行正常"
    )
)
goto :eof

REM 查看日志
:show_logs
call :log_info "显示服务日志..."
docker-compose -f %COMPOSE_FILE% logs -f
goto :eof

REM 查看状态
:show_status
call :log_info "显示服务状态..."
docker-compose -f %COMPOSE_FILE% ps
echo.
call :check_services_health
goto :eof

REM 清理资源
:cleanup
call :log_info "清理未使用的Docker资源..."
docker system prune -f
call :log_success "清理完成"
goto :eof

REM 备份数据库
:backup_database
call :log_info "备份数据库..."
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
set backup_file=backup_%timestamp%.sql

docker exec %PROJECT_NAME%_mysql_prod mysqldump -u root -proot123456 arcade_platform > %backup_file%
if errorlevel 1 (
    call :log_error "数据库备份失败"
) else (
    call :log_success "数据库备份完成: %backup_file%"
)
goto :eof

REM 主函数
:main
if "%1"=="start" (
    call :check_prerequisites
    call :check_env_file
    call :build_images
    call :start_services
    goto :eof
)

if "%1"=="stop" (
    call :stop_services
    goto :eof
)

if "%1"=="restart" (
    call :check_prerequisites
    call :check_env_file
    call :restart_services
    goto :eof
)

if "%1"=="logs" (
    call :show_logs
    goto :eof
)

if "%1"=="status" (
    call :show_status
    goto :eof
)

if "%1"=="cleanup" (
    call :cleanup
    goto :eof
)

if "%1"=="backup" (
    call :backup_database
    goto :eof
)

REM 显示帮助信息
echo 使用方法: %0 {start^|stop^|restart^|logs^|status^|cleanup^|backup}
echo.
echo 命令说明:
echo   start   - 启动所有服务
echo   stop    - 停止所有服务
echo   restart - 重启所有服务
echo   logs    - 查看服务日志
echo   status  - 查看服务状态
echo   cleanup - 清理Docker资源
echo   backup  - 备份数据库
exit /b 1

REM 执行主函数
call :main %* 
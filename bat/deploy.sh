#!/bin/bash

# 经典街机游戏平台生产环境部署脚本
# 使用方法: ./deploy.sh [start|stop|restart|logs|status]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="arcade-platform"
COMPOSE_FILE="docker-compose.prod.yml"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker和Docker Compose
check_prerequisites() {
    log_info "检查系统环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "系统环境检查通过"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f ".env" ]; then
        log_warning "未找到.env文件，正在从模板创建..."
        if [ -f "env.production.template" ]; then
            cp env.production.template .env
            log_warning "请编辑.env文件，设置正确的环境变量"
            log_warning "特别是数据库密码、JWT密钥等敏感信息"
            exit 1
        else
            log_error "未找到环境变量模板文件"
            exit 1
        fi
    fi
}

# 构建镜像
build_images() {
    log_info "构建Docker镜像..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    log_success "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    docker-compose -f $COMPOSE_FILE up -d
    
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    check_services_health
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    docker-compose -f $COMPOSE_FILE down
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE up -d
    
    log_info "等待服务启动..."
    sleep 30
    
    # 检查服务状态
    check_services_health
}

# 检查服务健康状态
check_services_health() {
    log_info "检查服务健康状态..."
    
    services=("mysql" "redis" "backend" "frontend")
    
    for service in "${services[@]}"; do
        container_name="${PROJECT_NAME}_${service}_prod"
        
        if docker ps | grep -q $container_name; then
            health_status=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "no-healthcheck")
            
            if [ "$health_status" = "healthy" ]; then
                log_success "$service 服务运行正常"
            elif [ "$health_status" = "no-healthcheck" ]; then
                log_warning "$service 服务运行中（无健康检查）"
            else
                log_warning "$service 服务运行中（健康检查失败）"
            fi
        else
            log_error "$service 服务未运行"
        fi
    done
}

# 查看日志
show_logs() {
    log_info "显示服务日志..."
    docker-compose -f $COMPOSE_FILE logs -f
}

# 查看状态
show_status() {
    log_info "显示服务状态..."
    docker-compose -f $COMPOSE_FILE ps
    echo ""
    check_services_health
}

# 清理资源
cleanup() {
    log_info "清理未使用的Docker资源..."
    docker system prune -f
    log_success "清理完成"
}

# 备份数据库
backup_database() {
    log_info "备份数据库..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backup_${timestamp}.sql"
    
    docker exec ${PROJECT_NAME}_mysql_prod mysqldump -u root -p${MYSQL_ROOT_PASSWORD:-root123456} ${MYSQL_DATABASE:-arcade_platform} > $backup_file
    
    if [ $? -eq 0 ]; then
        log_success "数据库备份完成: $backup_file"
    else
        log_error "数据库备份失败"
    fi
}

# 主函数
main() {
    case "$1" in
        "start")
            check_prerequisites
            check_env_file
            build_images
            start_services
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            check_prerequisites
            check_env_file
            restart_services
            ;;
        "logs")
            show_logs
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "backup")
            backup_database
            ;;
        *)
            echo "使用方法: $0 {start|stop|restart|logs|status|cleanup|backup}"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动所有服务"
            echo "  stop    - 停止所有服务"
            echo "  restart - 重启所有服务"
            echo "  logs    - 查看服务日志"
            echo "  status  - 查看服务状态"
            echo "  cleanup - 清理Docker资源"
            echo "  backup  - 备份数据库"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@" 
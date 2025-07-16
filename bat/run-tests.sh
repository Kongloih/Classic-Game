#!/bin/bash

# 经典游戏平台 - 测试运行脚本

echo "========================================"
echo "经典游戏平台 - 测试运行脚本"
echo "========================================"
echo

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示菜单
show_menu() {
    echo "请选择要运行的测试:"
    echo "1. 前端测试"
    echo "2. 后端测试"
    echo "3. 前端测试 (带覆盖率)"
    echo "4. 后端测试 (带覆盖率)"
    echo "5. 所有测试"
    echo "6. 退出"
    echo
}

# 运行前端测试
run_frontend_test() {
    echo -e "${BLUE}运行前端测试...${NC}"
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装前端依赖...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}开始前端测试...${NC}"
    npm test -- --watchAll=false
    
    cd ..
    echo
    echo -e "${GREEN}前端测试完成！${NC}"
    echo
}

# 运行后端测试
run_backend_test() {
    echo -e "${BLUE}运行后端测试...${NC}"
    cd backend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装后端依赖...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}开始后端测试...${NC}"
    npm test -- --watchAll=false
    
    cd ..
    echo
    echo -e "${GREEN}后端测试完成！${NC}"
    echo
}

# 运行前端测试 (带覆盖率)
run_frontend_coverage() {
    echo -e "${BLUE}运行前端测试 (带覆盖率)...${NC}"
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装前端依赖...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}开始前端测试 (带覆盖率)...${NC}"
    npm test -- --coverage --watchAll=false
    
    cd ..
    echo
    echo -e "${GREEN}前端测试 (带覆盖率) 完成！${NC}"
    echo
}

# 运行后端测试 (带覆盖率)
run_backend_coverage() {
    echo -e "${BLUE}运行后端测试 (带覆盖率)...${NC}"
    cd backend
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装后端依赖...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}开始后端测试 (带覆盖率)...${NC}"
    npm test -- --coverage --watchAll=false
    
    cd ..
    echo
    echo -e "${GREEN}后端测试 (带覆盖率) 完成！${NC}"
    echo
}

# 运行所有测试
run_all_tests() {
    echo -e "${BLUE}运行所有测试...${NC}"
    echo
    
    echo -e "${YELLOW}1. 运行前端测试...${NC}"
    run_frontend_coverage
    
    echo -e "${YELLOW}2. 运行后端测试...${NC}"
    run_backend_coverage
    
    echo
    echo -e "${GREEN}所有测试完成！${NC}"
    echo
}

# 主循环
while true; do
    show_menu
    read -p "请输入选择 (1-6): " choice
    
    case $choice in
        1)
            run_frontend_test
            read -p "按回车键继续..."
            ;;
        2)
            run_backend_test
            read -p "按回车键继续..."
            ;;
        3)
            run_frontend_coverage
            read -p "按回车键继续..."
            ;;
        4)
            run_backend_coverage
            read -p "按回车键继续..."
            ;;
        5)
            run_all_tests
            read -p "按回车键继续..."
            ;;
        6)
            echo
            echo -e "${GREEN}感谢使用测试脚本！${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选择，请重新输入${NC}"
            echo
            ;;
    esac
done 
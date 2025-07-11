#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 修复前端依赖和启动应用...\n');

try {
  // Step 1: 安装依赖
  console.log('1️⃣ 安装缺失的依赖包...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 依赖安装完成\n');

  // Step 2: 修复 React Query 导入
  console.log('2️⃣ 修复 React Query 导入...');
  const indexPath = path.join(__dirname, 'src', 'index.js');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // 更新导入语句
  indexContent = indexContent.replace(
    "import { QueryClient, QueryClientProvider } from 'react-query';",
    "import { QueryClient, QueryClientProvider } from '@tanstack/react-query';"
  );
  indexContent = indexContent.replace(
    "import { ReactQueryDevtools } from 'react-query/devtools';",
    "import { ReactQueryDevtools } from '@tanstack/react-query-devtools';"
  );
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ React Query 导入已修复\n');

  // Step 3: 检查其他可能的 React Query 使用
  console.log('3️⃣ 检查其他文件中的 React Query 使用...');
  
  // 检查是否有其他文件使用了旧的 react-query
  function updateReactQueryInFile(filePath) {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      if (content.includes("from 'react-query'")) {
        content = content.replace(/from 'react-query'/g, "from '@tanstack/react-query'");
        updated = true;
      }
      if (content.includes("from 'react-query/")) {
        content = content.replace(/from 'react-query\//g, "from '@tanstack/react-query-");
        updated = true;
      }
      
      if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ 已更新: ${filePath}`);
        return true;
      }
    }
    return false;
  }

  // 递归搜索src目录下的js和jsx文件
  function searchAndUpdateFiles(dir) {
    const files = fs.readdirSync(dir);
    let updatedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.includes('node_modules')) {
        updatedCount += searchAndUpdateFiles(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        if (updateReactQueryInFile(filePath)) {
          updatedCount++;
        }
      }
    }
    
    return updatedCount;
  }

  const srcPath = path.join(__dirname, 'src');
  const updatedFiles = searchAndUpdateFiles(srcPath);
  console.log(`✅ 共更新了 ${updatedFiles} 个文件\n`);

  // Step 4: 启动应用
  console.log('4️⃣ 启动前端应用...');
  console.log('🚀 正在启动 React 开发服务器...\n');
  
  execSync('npm start', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ 修复失败:', error.message);
  
  // 提供手动修复建议
  console.log('\n📝 手动修复步骤:');
  console.log('1. 运行: npm install');
  console.log('2. 更新 src/index.js 中的导入:');
  console.log("   - 将 'react-query' 改为 '@tanstack/react-query'");
  console.log("   - 将 'react-query/devtools' 改为 '@tanstack/react-query-devtools'");
  console.log('3. 运行: npm start');
  
  process.exit(1);
} 
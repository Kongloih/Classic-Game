// 修复脚本 - 解决编译错误
const fs = require('fs');
const path = require('path');

// 修复后端模型文件
const fixBackendModels = () => {
  const models = ['BattleRoom.js', 'BattleTable.js', 'UserStatus.js'];
  
  models.forEach(modelFile => {
    const filePath = path.join(__dirname, 'backend', 'src', 'models', modelFile);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 修复导入语句
      content = content.replace(
        /const sequelize = require\('\.\.\/config\/database'\);/g,
        "const { sequelize } = require('../config/database');"
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ 修复了 ${modelFile}`);
    }
  });
};

// 修复前端重复导入
const fixFrontendImports = () => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'games', 'GameHallPage.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 删除重复的导入
    const lines = content.split('\n');
    const filteredLines = [];
    let seenOfflineGameApi = false;
    
    for (const line of lines) {
      if (line.includes('import { offlineGameApi }')) {
        if (!seenOfflineGameApi) {
          filteredLines.push(line);
          seenOfflineGameApi = true;
        }
      } else {
        filteredLines.push(line);
      }
    }
    
    fs.writeFileSync(filePath, filteredLines.join('\n'));
    console.log('✅ 修复了前端重复导入');
  }
};

// 删除未使用的导入
const fixUnusedImports = () => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'App.js');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 删除未使用的GameHallPage导入
    content = content.replace(
      /import GameHallPage from '\.\/pages\/games\/GameHallPage';\n/g,
      ''
    );
    
    fs.writeFileSync(filePath, content);
    console.log('✅ 删除了未使用的导入');
  }
};

// 执行修复
console.log('🔧 开始修复编译错误...');
fixBackendModels();
fixFrontendImports();
fixUnusedImports();
console.log('✅ 修复完成！'); 
#!/usr/bin/env node

// 自动化测试运行脚本
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 颜色定义
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 打印带颜色的文本
function printColor(text, color) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

// 打印标题
function printTitle(title) {
  console.log('\n' + '='.repeat(60));
  printColor(title, 'bright');
  console.log('='.repeat(60));
}

// 打印步骤
function printStep(step) {
  printColor(`\n📋 ${step}`, 'cyan');
}

// 打印成功信息
function printSuccess(message) {
  printColor(`✅ ${message}`, 'green');
}

// 打印错误信息
function printError(message) {
  printColor(`❌ ${message}`, 'red');
}

// 打印警告信息
function printWarning(message) {
  printColor(`⚠️  ${message}`, 'yellow');
}

// 打印信息
function printInfo(message) {
  printColor(`ℹ️  ${message}`, 'blue');
}

// 检查目录是否存在
function checkDirectory(dir) {
  if (!fs.existsSync(dir)) {
    printError(`目录不存在: ${dir}`);
    return false;
  }
  return true;
}

// 检查文件是否存在
function checkFile(file) {
  if (!fs.existsSync(file)) {
    printError(`文件不存在: ${file}`);
    return false;
  }
  return true;
}

// 运行命令
function runCommand(command, cwd = process.cwd()) {
  try {
    printInfo(`执行命令: ${command}`);
    const result = execSync(command, { 
      cwd, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

// 安装依赖
function installDependencies(projectPath, projectName) {
  printStep(`安装 ${projectName} 依赖`);
  
  if (!checkDirectory(projectPath)) {
    return false;
  }
  
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!checkFile(packageJsonPath)) {
    printError(`${projectName} package.json 不存在`);
    return false;
  }
  
  const result = runCommand('npm install', projectPath);
  if (result.success) {
    printSuccess(`${projectName} 依赖安装成功`);
    return true;
  } else {
    printError(`${projectName} 依赖安装失败: ${result.output}`);
    return false;
  }
}

// 运行前端自动化测试
async function runFrontendAutomatedTests() {
  printTitle('前端自动化测试');
  
  const frontendPath = path.join(process.cwd(), 'frontend');
  
  // 检查前端目录
  if (!checkDirectory(frontendPath)) {
    return false;
  }
  
  // 安装依赖
  if (!installDependencies(frontendPath, '前端')) {
    return false;
  }
  
  // 检查测试文件
  const testFiles = [
    'src/utils/automatedTests.js',
    'src/__mocks__/mockData.js',
    'src/utils/testUtils.js'
  ];
  
  for (const file of testFiles) {
    const filePath = path.join(frontendPath, file);
    if (!checkFile(filePath)) {
      printError(`测试文件不存在: ${file}`);
      return false;
    }
  }
  
  printStep('运行前端自动化测试');
  
  // 创建临时测试文件
  const tempTestFile = path.join(frontendPath, 'src', 'automatedTestsRunner.js');
  const testRunnerCode = `
// 前端自动化测试运行器
import { gameTests, pageTests, reduxTests, utilsTests, testRunner } from './utils/automatedTests.js';

async function runFrontendTests() {
  console.log('🚀 开始运行前端自动化测试');
  
  // 添加测试套件
  testRunner.addTestSuite(gameTests);
  testRunner.addTestSuite(pageTests);
  testRunner.addTestSuite(reduxTests);
  testRunner.addTestSuite(utilsTests);
  
  // 运行所有测试
  await testRunner.runAllSuites();
}

// 运行测试
runFrontendTests().catch(console.error);
  `;
  
  try {
    fs.writeFileSync(tempTestFile, testRunnerCode);
    
    // 运行测试
    const result = runCommand('node --experimental-modules --es-module-specifier-resolution=node src/automatedTestsRunner.js', frontendPath);
    
    if (result.success) {
      printSuccess('前端自动化测试完成');
      console.log(result.output);
    } else {
      printError(`前端自动化测试失败: ${result.output}`);
    }
    
    // 清理临时文件
    fs.unlinkSync(tempTestFile);
    
    return result.success;
  } catch (error) {
    printError(`前端自动化测试执行错误: ${error.message}`);
    return false;
  }
}

// 运行后端自动化测试
async function runBackendAutomatedTests() {
  printTitle('后端自动化测试');
  
  const backendPath = path.join(process.cwd(), 'backend');
  
  // 检查后端目录
  if (!checkDirectory(backendPath)) {
    return false;
  }
  
  // 安装依赖
  if (!installDependencies(backendPath, '后端')) {
    return false;
  }
  
  // 检查测试文件
  const testFiles = [
    'src/utils/automatedTests.js',
    'src/__mocks__/mockData.js',
    'src/setupTests.js'
  ];
  
  for (const file of testFiles) {
    const filePath = path.join(backendPath, file);
    if (!checkFile(filePath)) {
      printError(`测试文件不存在: ${file}`);
      return false;
    }
  }
  
  printStep('运行后端自动化测试');
  
  // 创建临时测试文件
  const tempTestFile = path.join(backendPath, 'automatedTestsRunner.js');
  const testRunnerCode = `
// 后端自动化测试运行器
const { apiTests, databaseTests, middlewareTests, testRunner } = require('./src/utils/automatedTests.js');

async function runBackendTests() {
  console.log('🚀 开始运行后端自动化测试');
  
  // 添加测试套件
  testRunner.addTestSuite(apiTests);
  testRunner.addTestSuite(databaseTests);
  testRunner.addTestSuite(middlewareTests);
  
  // 运行所有测试
  await testRunner.runAllSuites();
}

// 运行测试
runBackendTests().catch(console.error);
  `;
  
  try {
    fs.writeFileSync(tempTestFile, testRunnerCode);
    
    // 运行测试
    const result = runCommand('node automatedTestsRunner.js', backendPath);
    
    if (result.success) {
      printSuccess('后端自动化测试完成');
      console.log(result.output);
    } else {
      printError(`后端自动化测试失败: ${result.output}`);
    }
    
    // 清理临时文件
    fs.unlinkSync(tempTestFile);
    
    return result.success;
  } catch (error) {
    printError(`后端自动化测试执行错误: ${error.message}`);
    return false;
  }
}

// 运行Jest测试
function runJestTests(projectPath, projectName) {
  printStep(`运行 ${projectName} Jest测试`);
  
  const result = runCommand('npm test -- --coverage --watchAll=false', projectPath);
  
  if (result.success) {
    printSuccess(`${projectName} Jest测试完成`);
    console.log(result.output);
    return true;
  } else {
    printError(`${projectName} Jest测试失败: ${result.output}`);
    return false;
  }
}

// 生成测试报告
function generateTestReport(frontendSuccess, backendSuccess, jestFrontendSuccess, jestBackendSuccess) {
  printTitle('测试报告');
  
  const totalTests = 4;
  const passedTests = [frontendSuccess, backendSuccess, jestFrontendSuccess, jestBackendSuccess]
    .filter(Boolean).length;
  
  console.log('\n📊 测试结果汇总:');
  console.log('─'.repeat(40));
  console.log(`前端自动化测试: ${frontendSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`后端自动化测试: ${backendSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`前端Jest测试: ${jestFrontendSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log(`后端Jest测试: ${jestBackendSuccess ? '✅ 通过' : '❌ 失败'}`);
  console.log('─'.repeat(40));
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过数: ${passedTests}`);
  console.log(`失败数: ${totalTests - passedTests}`);
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  
  if (passedTests === totalTests) {
    printSuccess('🎉 所有测试都通过了！');
  } else {
    printWarning(`⚠️  有 ${totalTests - passedTests} 个测试失败`);
  }
}

// 主函数
async function main() {
  printTitle('经典游戏平台 - 自动化测试系统');
  
  const startTime = Date.now();
  
  try {
    // 运行前端自动化测试
    const frontendSuccess = await runFrontendAutomatedTests();
    
    // 运行后端自动化测试
    const backendSuccess = await runBackendAutomatedTests();
    
    // 运行前端Jest测试
    const frontendPath = path.join(process.cwd(), 'frontend');
    const jestFrontendSuccess = runJestTests(frontendPath, '前端');
    
    // 运行后端Jest测试
    const backendPath = path.join(process.cwd(), 'backend');
    const jestBackendSuccess = runJestTests(backendPath, '后端');
    
    // 生成测试报告
    generateTestReport(frontendSuccess, backendSuccess, jestFrontendSuccess, jestBackendSuccess);
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    printInfo(`总耗时: ${totalDuration}ms`);
    
  } catch (error) {
    printError(`测试执行过程中发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
经典游戏平台 - 自动化测试系统

用法:
  node run-automated-tests.js [选项]

选项:
  --frontend-only    只运行前端测试
  --backend-only     只运行后端测试
  --jest-only        只运行Jest测试
  --automated-only   只运行自动化测试
  --help, -h         显示帮助信息

示例:
  node run-automated-tests.js                    # 运行所有测试
  node run-automated-tests.js --frontend-only    # 只运行前端测试
  node run-automated-tests.js --backend-only     # 只运行后端测试
  `);
  process.exit(0);
}

// 根据参数运行相应的测试
if (args.includes('--frontend-only')) {
  printTitle('前端测试');
  runFrontendAutomatedTests().then(success => {
    if (success) {
      runJestTests(path.join(process.cwd(), 'frontend'), '前端');
    }
  });
} else if (args.includes('--backend-only')) {
  printTitle('后端测试');
  runBackendAutomatedTests().then(success => {
    if (success) {
      runJestTests(path.join(process.cwd(), 'backend'), '后端');
    }
  });
} else if (args.includes('--jest-only')) {
  printTitle('Jest测试');
  const frontendPath = path.join(process.cwd(), 'frontend');
  const backendPath = path.join(process.cwd(), 'backend');
  runJestTests(frontendPath, '前端');
  runJestTests(backendPath, '后端');
} else if (args.includes('--automated-only')) {
  printTitle('自动化测试');
  runFrontendAutomatedTests();
  runBackendAutomatedTests();
} else {
  // 运行所有测试
  main();
} 
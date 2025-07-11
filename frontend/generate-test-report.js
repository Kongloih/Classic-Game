#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📝 开始生成测试报告...\n');

// 读取现有报告
const reportPath = path.join(__dirname, 'TEST_REPORT.md');
let report = fs.readFileSync(reportPath, 'utf8');

// 添加实际测试结果部分
const testResultsSection = `

---

## 🧪 实际测试执行结果

### 测试环境信息
- **Node版本**: ${process.version}
- **NPM版本**: ${require('child_process').execSync('npm --version', {encoding: 'utf8'}).trim()}
- **操作系统**: ${process.platform}
- **执行时间**: ${new Date().toLocaleString('zh-CN')}

### 详细测试日志

`;

report += testResultsSection;

// 执行LoadingSpinner测试
function runLoadingSpinnerTests() {
  return new Promise((resolve) => {
    console.log('🔄 执行 LoadingSpinner 测试...');
    
    report += `#### LoadingSpinner 组件测试
\`\`\`
`;

    const testProcess = spawn('npm', ['test', '--', '--testPathPattern=LoadingSpinner', '--watchAll=false', '--verbose'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    testProcess.on('close', (code) => {
      report += output;
      if (errorOutput) {
        report += '\n错误输出:\n' + errorOutput;
      }
      report += `\`\`\`
**退出代码**: ${code}
**测试状态**: ${code === 0 ? '✅ 通过' : '❌ 失败'}

`;
      
      console.log(`LoadingSpinner 测试完成，退出代码: ${code}\n`);
      resolve(code === 0);
    });
  });
}

// 执行API测试
function runApiTests() {
  return new Promise((resolve) => {
    console.log('🔄 执行 API 测试...');
    
    report += `#### API 服务测试
\`\`\`
`;

    const testProcess = spawn('npm', ['test', '--', '--testPathPattern=api.test', '--watchAll=false', '--verbose'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    testProcess.on('close', (code) => {
      report += output;
      if (errorOutput) {
        report += '\n错误输出:\n' + errorOutput;
      }
      report += `\`\`\`
**退出代码**: ${code}
**测试状态**: ${code === 0 ? '✅ 通过' : '❌ 失败'}

`;
      
      console.log(`API 测试完成，退出代码: ${code}\n`);
      resolve(code === 0);
    });
  });
}

// 运行覆盖率测试
function runCoverageTests() {
  return new Promise((resolve) => {
    console.log('🔄 执行覆盖率测试...');
    
    report += `#### 测试覆盖率报告
\`\`\`
`;

    const testProcess = spawn('npm', ['run', 'test:coverage'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    testProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      process.stderr.write(text);
    });

    testProcess.on('close', (code) => {
      report += output;
      if (errorOutput) {
        report += '\n错误输出:\n' + errorOutput;
      }
      report += `\`\`\`
**退出代码**: ${code}
**覆盖率状态**: ${code === 0 ? '✅ 生成成功' : '❌ 生成失败'}

`;
      
      console.log(`覆盖率测试完成，退出代码: ${code}\n`);
      resolve(code === 0);
    });
  });
}

// 主执行函数
async function main() {
  try {
    const spinnerResult = await runLoadingSpinnerTests();
    const apiResult = await runApiTests();
    const coverageResult = await runCoverageTests();
    
    // 添加总结
    report += `
---

## 📊 测试执行总结

### 测试结果统计
- **LoadingSpinner 测试**: ${spinnerResult ? '✅ 通过' : '❌ 失败'}
- **API 测试**: ${apiResult ? '✅ 通过' : '❌ 失败'}  
- **覆盖率生成**: ${coverageResult ? '✅ 成功' : '❌ 失败'}

### 整体状态
${spinnerResult && apiResult ? '🎉 **所有核心测试通过！**' : '⚠️ **部分测试需要进一步调试**'}

### 生成的文件
- 测试报告: \`frontend/TEST_REPORT.md\`
- 覆盖率报告: \`frontend/coverage/\` (如果生成成功)
- 测试日志: 包含在本报告中

---

*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
*自动生成脚本: \`generate-test-report.js\`*
`;

    // 写入更新的报告
    fs.writeFileSync(reportPath, report, 'utf8');
    
    console.log('📝 测试报告已更新!');
    console.log(`📁 报告位置: ${reportPath}`);
    
    if (spinnerResult && apiResult) {
      console.log('\n🎉 所有测试执行完成！');
      process.exit(0);
    } else {
      console.log('\n⚠️ 部分测试失败，请查看报告详情');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 测试执行出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 
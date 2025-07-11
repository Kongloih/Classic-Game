#!/usr/bin/env node

// 验证测试修复是否有效的简单脚本
const { spawn } = require('child_process');

console.log('🔍 验证前端测试修复...\n');

// 测试 1: 验证 LoadingSpinner 测试
console.log('1️⃣ 测试 LoadingSpinner 组件...');
const testSpinner = spawn('npm', ['test', '--', '--testPathPattern=LoadingSpinner', '--watchAll=false'], {
  stdio: 'pipe',
  shell: true
});

testSpinner.stdout.on('data', (data) => {
  console.log(data.toString());
});

testSpinner.stderr.on('data', (data) => {
  console.error(data.toString());
});

testSpinner.on('close', (code) => {
  if (code === 0) {
    console.log('✅ LoadingSpinner 测试通过\n');
    
    // 测试 2: 验证 API 测试
    console.log('2️⃣ 测试 API 服务...');
    const testApi = spawn('npm', ['test', '--', '--testPathPattern=api.test', '--watchAll=false'], {
      stdio: 'inherit',
      shell: true
    });
    
    testApi.on('close', (apiCode) => {
      if (apiCode === 0) {
        console.log('\n✅ API 测试通过');
        console.log('\n🎉 所有测试修复验证完成！');
      } else {
        console.log('\n❌ API 测试仍有问题');
      }
    });
  } else {
    console.log('❌ LoadingSpinner 测试失败');
  }
}); 
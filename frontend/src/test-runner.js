// Simple test runner to verify our fixes
const { execSync } = require('child_process');

console.log('🧪 运行前端测试验证...\n');

try {
  // Test 1: Check if LoadingSpinner tests pass
  console.log('1️⃣ 测试 LoadingSpinner 组件...');
  execSync('npm test -- --testPathPattern=LoadingSpinner --watchAll=false --verbose', { 
    stdio: 'inherit',
    timeout: 30000
  });
  console.log('✅ LoadingSpinner 测试通过\n');

  // Test 2: Check if API tests pass
  console.log('2️⃣ 测试 API 服务...');
  execSync('npm test -- --testPathPattern=api.test --watchAll=false --verbose', { 
    stdio: 'inherit',
    timeout: 30000
  });
  console.log('✅ API 测试通过\n');

  console.log('🎉 所有测试都通过了！');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  process.exit(1);
} 
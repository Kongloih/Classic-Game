const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 开始运行战斗系统单元测试...\n');

try {
  // 运行所有测试
  console.log('📋 运行所有测试...');
  execSync('npm test', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ 所有测试通过！');

  // 运行覆盖率测试
  console.log('\n📊 生成测试覆盖率报告...');
  execSync('npm run test:coverage', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n🎉 测试完成！覆盖率报告已生成在 coverage/ 目录中');

} catch (error) {
  console.error('\n❌ 测试失败:', error.message);
  process.exit(1);
} 
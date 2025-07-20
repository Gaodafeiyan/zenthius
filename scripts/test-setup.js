#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 检查项目配置...\n');

// 检查必要的文件是否存在
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  '.eslintrc.js',
  '.prettierrc',
  'env.example',
  'src/extensions/users-permissions/content-types/user/schema.json',
  'src/extensions/users-permissions/content-types/user/lifecycles.js',
  'src/api/subscription-plan/content-types/subscription-plan/schema.json',
  'src/api/subscription-order/content-types/subscription-order/schema.json',
  'src/api/wallet-balance/content-types/wallet-balance/schema.json',
  'src/api/wallet-tx/content-types/wallet-tx/schema.json',
  'src/api/referral-reward/content-types/referral-reward/schema.json',
  'src/api/usdt-withdraw/content-types/usdt-withdraw/schema.json',
  'database/seeds/001_subscription_plans.js',
  'src/api/subscription-order/services/subscription-order.ts',
  'src/api/wallet-balance/services/wallet-balance.ts',
  'src/api/subscription-order/controllers/subscription-order.ts',
  'src/api/wallet-balance/controllers/wallet-balance.ts',
  'src/api/usdt-withdraw/controllers/usdt-withdraw.ts',
  'src/api/referral-reward/controllers/referral-reward.ts',
  'src/extensions/users-permissions/controllers/auth.ts',
  'src/extensions/users-permissions/routes/auth.ts',
  'src/api/subscription-order/routes/subscription-order.ts',
  'src/api/wallet-balance/routes/wallet-balance.ts',
  'src/api/usdt-withdraw/routes/usdt-withdraw.ts',
  'src/api/referral-reward/routes/referral-reward.ts',
  'src/extensions/cron/index.ts',
  'README.md',
  'BACKEND_IMPLEMENTATION_SUMMARY.md',
  'postman_collection.json'
];

let missingFiles = [];
let existingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    existingFiles.push(file);
    console.log(`✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`❌ ${file} - 缺失`);
  }
}

console.log(`\n📊 文件检查结果:`);
console.log(`✅ 存在的文件: ${existingFiles.length}`);
console.log(`❌ 缺失的文件: ${missingFiles.length}`);

if (missingFiles.length > 0) {
  console.log('\n⚠️  缺失的文件:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// 检查 package.json 中的依赖
console.log('\n📦 检查依赖配置...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const requiredDependencies = [
  'decimal.js',
  'ethers',
  'node-cron',
  'uuid'
];

const requiredDevDependencies = [
  'vitest',
  'eslint',
  'prettier',
  '@types/uuid',
  '@types/node-cron'
];

console.log('\n依赖检查:');
for (const dep of requiredDependencies) {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - 缺失`);
  }
}

console.log('\n开发依赖检查:');
for (const dep of requiredDevDependencies) {
  if (packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep} - ${packageJson.devDependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - 缺失`);
  }
}

// 检查脚本配置
console.log('\n📜 脚本配置检查:');
const requiredScripts = ['test', 'lint', 'format', 'setup'];
for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script} 脚本已配置`);
  } else {
    console.log(`❌ ${script} 脚本缺失`);
  }
}

console.log('\n🎯 项目结构检查完成！');
console.log('\n下一步:');
console.log('1. 运行 npm install 安装依赖');
console.log('2. 运行 npm run setup 初始化项目');
console.log('3. 编辑 .env.development 配置环境变量');
console.log('4. 运行 npm run develop 启动开发服务器');
console.log('5. 访问 http://localhost:1337/admin 创建管理员账户');
console.log('6. 导入 postman_collection.json 测试 API');

if (missingFiles.length === 0) {
  console.log('\n🎉 所有文件都已就绪，可以推送到 Git！');
} else {
  console.log('\n⚠️  请先解决缺失的文件，然后再推送到 Git。');
} 
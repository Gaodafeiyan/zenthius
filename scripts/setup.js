#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 设置 Strapi 投资平台后端...\n');

// 检查环境变量文件
const envFile = path.join(__dirname, '..', '.env.development');
if (!fs.existsSync(envFile)) {
  console.log('📝 创建环境变量文件...');
  const envExample = path.join(__dirname, '..', 'env.example');
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    console.log('✅ 已创建 .env.development 文件');
    console.log('⚠️  请编辑 .env.development 文件，配置必要的环境变量');
  } else {
    console.log('❌ 未找到 env.example 文件');
  }
} else {
  console.log('✅ 环境变量文件已存在');
}

// 检查数据库目录
const dbDir = path.join(__dirname, '..', '.tmp');
if (!fs.existsSync(dbDir)) {
  console.log('📁 创建数据库目录...');
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ 已创建数据库目录');
} else {
  console.log('✅ 数据库目录已存在');
}

console.log('\n🎉 设置完成！');
console.log('\n下一步：');
console.log('1. 编辑 .env.development 文件配置环境变量');
console.log('2. 运行 npm install 安装依赖');
console.log('3. 运行 npm run develop 启动开发服务器');
console.log('4. 访问 http://localhost:1337/admin 创建管理员账户');
console.log('5. 导入 postman_collection.json 到 Postman 测试 API'); 
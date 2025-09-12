#!/usr/bin/env node

// 加载 dotenv 来读取环境变量文件
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

console.log('🔍 检查环境变量配置...\n');

// 检查必要的环境变量
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL'
];

let allGood = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.log(`❌ ${envVar}: 未设置`);
    allGood = false;
  } else if (value.includes('your-') || value.includes('example')) {
    console.log(`⚠️  ${envVar}: 使用示例值，需要更新为真实值`);
    allGood = false;
  } else {
    console.log(`✅ ${envVar}: 已设置`);
  }
});

console.log('\n📋 环境变量检查完成');

if (allGood) {
  console.log('🎉 所有环境变量配置正确！');
} else {
  console.log('\n🔧 需要修复的问题:');
  console.log('1. 确保 .env.local 文件存在');
  console.log('2. 填入真实的 Google OAuth 凭据');
  console.log('3. 配置正确的数据库连接字符串');
  console.log('4. 设置有效的邮件服务 API 密钥');
}

// 检查 Google OAuth 配置
console.log('\n🔐 Google OAuth 配置检查:');
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  console.log(`✅ Google Client ID: ${googleClientId.substring(0, 10)}...`);
  console.log(`✅ Google Client Secret: ${googleClientSecret.substring(0, 10)}...`);
  
  // 验证格式
  if (googleClientId.includes('.apps.googleusercontent.com')) {
    console.log('✅ Client ID 格式正确');
  } else {
    console.log('⚠️  Client ID 格式可能不正确');
  }
  
  if (googleClientSecret.startsWith('GOCSPX-')) {
    console.log('✅ Client Secret 格式正确');
  } else {
    console.log('⚠️  Client Secret 格式可能不正确');
  }
}

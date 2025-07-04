#!/usr/bin/env node

// 生成安全的 JWT Secret
import crypto from 'crypto';

const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('='.repeat(60));
console.log('Generated JWT Secret:');
console.log('='.repeat(60));
console.log(jwtSecret);
console.log('='.repeat(60));
console.log('\n請將此密鑰複製到您的 .env 檔案中的 JWT_SECRET=');
console.log('警告：請勿將此密鑰提交到版本控制！');
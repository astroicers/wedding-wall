#!/usr/bin/env node

import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

// 生成安全的 JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

// 讀取 .env.example
const envExamplePath = join(projectRoot, '.env.example');
const envPath = join(projectRoot, '.env');

if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example 檔案不存在');
  process.exit(1);
}

// 檢查是否已有 .env 檔案
if (fs.existsSync(envPath)) {
  console.log('⚠️  .env 檔案已存在，將建立備份...');
  fs.copyFileSync(envPath, `${envPath}.backup.${Date.now()}`);
}

// 讀取 .env.example 內容
let envContent = fs.readFileSync(envExamplePath, 'utf8');

// 替換 JWT_SECRET
envContent = envContent.replace(
  'JWT_SECRET=your-jwt-secret-key',
  `JWT_SECRET=${jwtSecret}`
);

// 寫入 .env 檔案
fs.writeFileSync(envPath, envContent);

console.log('✅ .env 檔案已創建！');
console.log('');
console.log('📝 請完成以下設定：');
console.log('1. 依照 GOOGLE_OAUTH_SETUP.md 設定 Google OAuth');
console.log('2. 在 .env 檔案中填入您的 Google OAuth 憑證：');
console.log('   - GOOGLE_CLIENT_ID=您的用戶端ID');
console.log('   - GOOGLE_CLIENT_SECRET=您的用戶端密碼');
console.log('');
console.log('🔒 JWT Secret 已自動生成並設定完成');
console.log('⚠️  請勿將 .env 檔案提交到版本控制！');
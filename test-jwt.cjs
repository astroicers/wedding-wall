const jwt = require('jsonwebtoken');

// 使用 .env 文件中相同的 JWT secret
const JWT_SECRET = '4929eed7156fd349ea98c0caa449d726cf09ac29664b4ee1c2495fc3be702f5a614bdb192bda256de6b5347168dedb7e90a1441e0ef58974886625a0ff63c07e';

console.log('Testing JWT signing and verification...');
console.log('JWT Secret length:', JWT_SECRET.length);
console.log('JWT Secret preview:', JWT_SECRET.substring(0, 16) + '...');

// 創建一個測試 token
const testPayload = {
  sub: '104445071947647440200',
  email: 'test@example.com',
  name: 'Test User'
};

try {
  // 簽名 token
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
  console.log('\n✅ Token generated successfully');
  console.log('Token preview:', token.substring(0, 50) + '...');
  console.log('Token length:', token.length);
  
  // 驗證 token
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('\n✅ Token verified successfully');
  console.log('Decoded payload:', decoded);
  
} catch (error) {
  console.log('\n❌ JWT test failed:', error.message);
}

// 測試一個可能被截斷的 token
console.log('\n--- Testing truncated token ---');
try {
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
  const truncatedToken = token.substring(0, token.length - 10); // 截斷最後 10 個字符
  console.log('Original token length:', token.length);
  console.log('Truncated token length:', truncatedToken.length);
  
  const decoded = jwt.verify(truncatedToken, JWT_SECRET);
  console.log('Truncated token verified (should not happen)');
} catch (error) {
  console.log('❌ Truncated token failed as expected:', error.message);
}
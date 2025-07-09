#!/usr/bin/env node

// Debug script to test authentication flow
const http = require('http');
const https = require('https');
const url = require('url');

const APP_URL = 'http://localhost:3000';

async function makeRequest(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = url.parse(requestUrl);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const req = lib.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('🔍 Testing authentication endpoints...\n');
  
  // Test 1: Check if app is running
  try {
    console.log('1. Testing app accessibility...');
    const response = await makeRequest(`${APP_URL}/`);
    console.log(`   ✅ App responded with status: ${response.statusCode}`);
  } catch (error) {
    console.log(`   ❌ App not accessible: ${error.message}`);
    return;
  }
  
  // Test 2: Test API endpoint without auth
  try {
    console.log('\n2. Testing API endpoint without authentication...');
    const response = await makeRequest(`${APP_URL}/api/users/test/walls`);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Body: ${response.body.substring(0, 200)}...`);
  } catch (error) {
    console.log(`   ❌ API request failed: ${error.message}`);
  }
  
  // Test 3: Test API endpoint with mock auth header
  try {
    console.log('\n3. Testing API endpoint with mock Authorization header...');
    const response = await makeRequest(`${APP_URL}/api/users/test/walls`, {
      headers: {
        'Authorization': 'Bearer mock-token-for-testing'
      }
    });
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Body: ${response.body.substring(0, 200)}...`);
  } catch (error) {
    console.log(`   ❌ API request failed: ${error.message}`);
  }
  
  // Test 4: Check server logs for debug info
  console.log('\n4. Server should show debug logs in Docker output');
  console.log('   Run: docker-compose logs -f wedding-wall-app');
  
  console.log('\n🔍 Authentication debugging complete!');
  console.log('\nNext steps:');
  console.log('1. Check the browser console for token storage debug logs');
  console.log('2. Check Docker logs for API request debug logs');
  console.log('3. Verify OAuth callback sets tokens correctly');
}

testAuth().catch(console.error);
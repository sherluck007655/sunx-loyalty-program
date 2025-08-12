const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    const response = await axios.post(`${API_BASE}/auth/admin/login`, {
      email: 'admin@sunx.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Admin login failed!');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testInstallerRegistration() {
  try {
    console.log('\nTesting installer registration...');
    const response = await axios.post(`${API_BASE}/auth/installer/register`, {
      name: 'Test Installer',
      email: 'test@example.com',
      phone: '+923001234567',
      password: 'password123',
      cnic: '12345-1234567-1',
      address: 'Test Address, Test City'
    });
    
    console.log('✅ Installer registration successful!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Installer registration failed!');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function testInstallerLogin() {
  try {
    console.log('\nTesting installer login...');
    const response = await axios.post(`${API_BASE}/auth/installer/login`, {
      emailOrPhone: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Installer login successful!');
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.log('❌ Installer login failed!');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests...\n');
  
  await testAdminLogin();
  await testInstallerRegistration();
  await testInstallerLogin();
  
  console.log('\n🏁 Tests completed!');
}

runTests();

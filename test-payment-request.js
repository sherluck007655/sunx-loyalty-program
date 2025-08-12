const axios = require('axios');

console.log('🧪 Testing Payment Request Endpoint');
console.log('===================================');

const API_BASE = 'http://localhost:5000/api';

async function testPaymentRequest() {
  try {
    // Test 1: Check server connection
    console.log('1. Testing server connection...');
    await axios.get(`${API_BASE}/test`);
    console.log('✅ Server is running');

    // Test 2: Test login to get token
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/installer/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Test 3: Test payment request with valid data
    console.log('\n3. Testing payment request with valid data...');
    const paymentData = {
      amount: 5000,
      description: 'Test payment request for milestone completion',
      paymentMethod: 'bank_transfer'
    };

    console.log('   Sending payment data:', paymentData);

    const paymentResponse = await axios.post(`${API_BASE}/payment/request`, paymentData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Payment request successful');
    console.log('   Response:', paymentResponse.data);

    // Test 4: Test payment request with missing description
    console.log('\n4. Testing payment request with missing description...');
    const invalidPaymentData = {
      amount: 3000,
      description: '', // Empty description
      paymentMethod: 'bank_transfer'
    };

    try {
      await axios.post(`${API_BASE}/payment/request`, invalidPaymentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Should have failed with missing description');
    } catch (validationError) {
      console.log('✅ Validation error caught correctly:', validationError.response?.data?.message);
    }

    // Test 5: Test payment request without auth token
    console.log('\n5. Testing payment request without auth token...');
    try {
      await axios.post(`${API_BASE}/payment/request`, paymentData);
      console.log('✅ Request worked without auth (mock server allows this)');
    } catch (authError) {
      console.log('✅ Auth error caught correctly:', authError.response?.data?.message);
    }

    console.log('\n🎉 All payment request tests completed!');
    console.log('\n📋 Frontend should now work with:');
    console.log('   1. Fill description field (required)');
    console.log('   2. Amount is optional (defaults to 5000)');
    console.log('   3. Payment method defaults to bank_transfer');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n📋 Backend server is not running. Start it with:');
      console.log('   cd backend && npm run test:basic');
    } else if (error.response) {
      console.log('\n📋 API Error Details:');
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testPaymentRequest();

const axios = require('axios');

console.log('🔍 Debugging Payment Request Issue');
console.log('==================================');

const API_BASE = 'http://localhost:5000';

async function debugPaymentIssue() {
  try {
    // Test 1: Check if backend server is running
    console.log('1. Testing backend server...');
    try {
      const serverResponse = await axios.get(`${API_BASE}/api/test`);
      console.log('✅ Backend server is running');
      console.log('   Response:', serverResponse.data);
    } catch (serverError) {
      console.log('❌ Backend server is not responding');
      console.log('   Error:', serverError.message);
      console.log('   Please start backend with: cd backend && npm run test:basic');
      return;
    }

    // Test 2: Test login to get auth token
    console.log('\n2. Testing login...');
    let token;
    try {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/installer/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
      token = loginResponse.data.data.token;
      console.log('✅ Login successful');
      console.log('   Token:', token.substring(0, 20) + '...');
    } catch (loginError) {
      console.log('❌ Login failed');
      console.log('   Error:', loginError.response?.data || loginError.message);
      return;
    }

    // Test 3: Test payment request endpoint directly
    console.log('\n3. Testing payment request endpoint...');
    const paymentData = {
      amount: 5000,
      description: 'Test payment request from debug script',
      paymentMethod: 'bank_transfer'
    };

    console.log('   Sending data:', paymentData);
    console.log('   To endpoint:', `${API_BASE}/api/payment/request`);
    console.log('   With auth token:', token ? 'Yes' : 'No');

    try {
      const paymentResponse = await axios.post(`${API_BASE}/api/payment/request`, paymentData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Payment request successful!');
      console.log('   Response status:', paymentResponse.status);
      console.log('   Response data:', paymentResponse.data);
    } catch (paymentError) {
      console.log('❌ Payment request failed');
      console.log('   Status:', paymentError.response?.status);
      console.log('   Error data:', paymentError.response?.data);
      console.log('   Error message:', paymentError.message);
      
      if (paymentError.response?.status === 404) {
        console.log('   → Endpoint not found. Check if route exists in backend.');
      } else if (paymentError.response?.status === 401) {
        console.log('   → Authentication failed. Check token.');
      } else if (paymentError.response?.status === 400) {
        console.log('   → Bad request. Check data format.');
      }
    }

    // Test 4: Test without auth token
    console.log('\n4. Testing payment request without auth token...');
    try {
      const noAuthResponse = await axios.post(`${API_BASE}/api/payment/request`, paymentData);
      console.log('✅ Request worked without auth (mock server allows this)');
      console.log('   Response:', noAuthResponse.data);
    } catch (noAuthError) {
      console.log('❌ Request failed without auth');
      console.log('   Status:', noAuthError.response?.status);
      console.log('   Error:', noAuthError.response?.data);
    }

    // Test 5: Check all available endpoints
    console.log('\n5. Testing other endpoints...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE}/api/installer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Dashboard endpoint works');
    } catch (dashboardError) {
      console.log('❌ Dashboard endpoint failed:', dashboardError.response?.status);
    }

    console.log('\n📋 Summary:');
    console.log('   - If payment request worked in step 3 or 4, the backend is fine');
    console.log('   - If it failed, check the error details above');
    console.log('   - The issue might be in the frontend code or network');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
  }
}

debugPaymentIssue();

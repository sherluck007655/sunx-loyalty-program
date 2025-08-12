const axios = require('axios');

console.log('🧪 Testing Serial Number Endpoint');
console.log('=================================');

const API_BASE = 'http://localhost:5000/api';

async function testSerialEndpoint() {
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const serverTest = await axios.get(`${API_BASE}/test`);
    console.log('✅ Server is running');

    // Test 2: Test login to get auth token
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/installer/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');

    // Test 3: Test adding a serial number
    console.log('\n3. Testing add serial number...');
    const serialData = {
      serialNumber: 'TEST123456',
      installationDate: new Date().toISOString().split('T')[0],
      location: {
        address: 'Test Location',
        city: 'Lahore'
      },
      inverterModel: 'SunX-5000',
      capacity: 5000,
      notes: 'Test installation'
    };

    const addSerialResponse = await axios.post(`${API_BASE}/serial/add`, serialData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Serial number added successfully');
    console.log('   Serial:', addSerialResponse.data.data.serial.serialNumber);

    // Test 4: Test getting serial list
    console.log('\n4. Testing get serial list...');
    const getSerialResponse = await axios.get(`${API_BASE}/serial`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Serial list retrieved');
    console.log('   Total serials:', getSerialResponse.data.data.serials.length);

    // Test 5: Test dashboard update
    console.log('\n5. Testing dashboard update...');
    const dashboardResponse = await axios.get(`${API_BASE}/installer/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Dashboard updated');
    console.log('   Total inverters:', dashboardResponse.data.data.installer.totalInverters);
    console.log('   Total points:', dashboardResponse.data.data.installer.totalPoints);
    console.log('   Progress:', dashboardResponse.data.data.installer.progressPercentage + '%');

    console.log('\n🎉 All tests passed! The serial number functionality is working correctly.');
    console.log('\n📋 You can now:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Login with: test@example.com / password123');
    console.log('   3. Go to "Add Serial Number" and try adding a serial');
    console.log('   4. The dashboard should update with your progress');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n📋 Backend server is not running. Please start it with:');
      console.log('   cd backend && npm run test:basic');
    } else if (error.response?.status === 400) {
      console.log('\n📋 API Error Details:');
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.message);
      console.log('   Data sent:', JSON.stringify(error.config?.data, null, 2));
    }
  }
}

testSerialEndpoint();

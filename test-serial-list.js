const axios = require('axios');

console.log('🧪 Testing Serial List Endpoint');
console.log('===============================');

const API_BASE = 'http://localhost:5000/api';

async function testSerialList() {
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

    // Test 3: Test getting serial list
    console.log('\n3. Testing serial list endpoint...');
    const serialListResponse = await axios.get(`${API_BASE}/serial`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Serial list endpoint working');
    console.log('   Response structure:', {
      success: serialListResponse.data.success,
      dataKeys: Object.keys(serialListResponse.data.data || {}),
      serialsCount: serialListResponse.data.data?.serials?.length || 0
    });

    if (serialListResponse.data.data?.serials) {
      console.log('   Serials found:');
      serialListResponse.data.data.serials.forEach((serial, index) => {
        console.log(`     ${index + 1}. ${serial.serialNumber} (${serial.installationDate})`);
      });
    }

    // Test 4: Test adding a serial and then checking list
    console.log('\n4. Testing add serial and list update...');
    const newSerial = {
      serialNumber: 'TEST' + Date.now(),
      installationDate: new Date().toISOString().split('T')[0],
      location: { address: 'Test Location', city: 'Test City' },
      inverterModel: 'SunX-5000',
      capacity: 5000
    };

    await axios.post(`${API_BASE}/serial/add`, newSerial, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Serial added');

    // Check list again
    const updatedListResponse = await axios.get(`${API_BASE}/serial`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Updated list retrieved');
    console.log('   New serials count:', updatedListResponse.data.data?.serials?.length || 0);

    console.log('\n🎉 All tests passed!');
    console.log('\n📋 Frontend should now show:');
    console.log('   1. Demo serials (DEMO123456, DEMO789012)');
    console.log('   2. Any serials you added through the form');
    console.log('   3. The test serial we just added');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n📋 Backend server is not running. Start it with:');
      console.log('   cd backend && npm run test:basic');
    }
  }
}

testSerialList();

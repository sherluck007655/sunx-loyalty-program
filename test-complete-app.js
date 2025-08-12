const axios = require('axios');

console.log('🧪 SunX Loyalty Program - Complete Application Test');
console.log('==================================================');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let installerId = '';

// Test data
const testInstaller = {
  name: 'Test Installer',
  email: 'test@example.com',
  phone: '+923001234567',
  password: 'password123',
  cnic: '12345-1234567-1',
  address: 'Test Address, Lahore'
};

const testSerial = {
  serialNumber: 'TEST123456',
  installationDate: new Date().toISOString().split('T')[0],
  location: {
    address: 'Test Location',
    city: 'Lahore',
    coordinates: { lat: 31.5204, lng: 74.3587 }
  },
  inverterModel: 'SunX-5000',
  capacity: 5000
};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: useAuth ? { Authorization: `Bearer ${authToken}` } : {}
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

// Test functions
async function testServerConnection() {
  console.log('\n1. Testing Server Connection...');
  const result = await apiCall('GET', '/test');
  
  if (result.success) {
    console.log('✅ Server is running and accessible');
    return true;
  } else {
    console.log('❌ Server connection failed:', result.error);
    return false;
  }
}

async function testInstallerRegistration() {
  console.log('\n2. Testing Installer Registration...');
  const result = await apiCall('POST', '/auth/installer/register', testInstaller);
  
  if (result.success) {
    console.log('✅ Registration successful');
    console.log(`   Loyalty ID: ${result.data.data.installer.loyaltyCardId}`);
    return true;
  } else {
    console.log('❌ Registration failed:', result.error);
    return false;
  }
}

async function testInstallerLogin() {
  console.log('\n3. Testing Installer Login...');
  const result = await apiCall('POST', '/auth/installer/login', {
    email: testInstaller.email,
    password: testInstaller.password
  });
  
  if (result.success) {
    authToken = result.data.data.token;
    installerId = result.data.data.installer.id;
    console.log('✅ Login successful');
    console.log(`   Token received: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ Login failed:', result.error);
    return false;
  }
}

async function testDashboard() {
  console.log('\n4. Testing Dashboard Data...');
  const result = await apiCall('GET', '/installer/dashboard', null, true);
  
  if (result.success) {
    const { installer, stats } = result.data.data;
    console.log('✅ Dashboard data loaded');
    console.log(`   Installer: ${installer.name}`);
    console.log(`   Total Inverters: ${installer.totalInverters}`);
    console.log(`   Total Points: ${installer.totalPoints}`);
    console.log(`   Eligible for Payment: ${installer.isEligibleForPayment}`);
    return true;
  } else {
    console.log('❌ Dashboard failed:', result.error);
    return false;
  }
}

async function testSerialNumberSubmission() {
  console.log('\n5. Testing Serial Number Submission...');
  const result = await apiCall('POST', '/serial/add', testSerial, true);
  
  if (result.success) {
    console.log('✅ Serial number added successfully');
    console.log(`   Serial: ${result.data.data.serial.serialNumber}`);
    return true;
  } else {
    console.log('❌ Serial submission failed:', result.error);
    return false;
  }
}

async function testPaymentHistory() {
  console.log('\n6. Testing Payment History...');
  const result = await apiCall('GET', '/payment/history', null, true);
  
  if (result.success) {
    console.log('✅ Payment history loaded');
    console.log(`   Total Payments: ${result.data.data.payments.length}`);
    return true;
  } else {
    console.log('❌ Payment history failed:', result.error);
    return false;
  }
}

async function testPaymentRequest() {
  console.log('\n7. Testing Payment Request...');
  const paymentData = {
    amount: 5000,
    description: 'Test payment request',
    paymentMethod: 'bank_transfer'
  };
  
  const result = await apiCall('POST', '/payment/request', paymentData, true);
  
  if (result.success) {
    console.log('✅ Payment request submitted');
    console.log(`   Amount: PKR ${result.data.data.payment.amount}`);
    console.log(`   Status: ${result.data.data.payment.status}`);
    return true;
  } else {
    console.log('❌ Payment request failed:', result.error);
    return false;
  }
}

async function testAdminLogin() {
  console.log('\n8. Testing Admin Login...');
  const result = await apiCall('POST', '/auth/admin/login', {
    email: 'admin@sunx.com',
    password: 'admin123'
  });
  
  if (result.success) {
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed:', result.error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('Starting comprehensive application test...\n');
  
  const tests = [
    testServerConnection,
    testInstallerRegistration,
    testInstallerLogin,
    testDashboard,
    testSerialNumberSubmission,
    testPaymentHistory,
    testPaymentRequest,
    testAdminLogin
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The application is working correctly.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Login with: test@example.com / password123');
    console.log('   3. Explore the dashboard and features');
    console.log('   4. Try the admin panel: admin@sunx.com / admin123');
  } else {
    console.log('\n⚠️  Some tests failed. Check the error messages above.');
    console.log('   Make sure the backend server is running on port 5000');
  }
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/test`);
    runAllTests();
  } catch (error) {
    console.log('❌ Backend server is not running!');
    console.log('\n📋 To start the server:');
    console.log('   1. Open a new terminal');
    console.log('   2. Run: cd backend && npm run test:basic');
    console.log('   3. Wait for "Server running on port 5000"');
    console.log('   4. Then run this test again');
  }
}

checkServer();

const axios = require('axios');

console.log('🧪 Testing Payment Request Directly');
console.log('===================================');

async function testPaymentDirect() {
  try {
    console.log('1. Testing server connection...');
    await axios.get('http://localhost:5000/api/test');
    console.log('✅ Server is running');

    console.log('\n2. Testing payment request without auth...');
    const paymentData = {
      amount: 5000,
      description: 'Direct test payment request',
      paymentMethod: 'bank_transfer'
    };

    console.log('Sending data:', paymentData);
    
    const response = await axios.post('http://localhost:5000/api/payment/request', paymentData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Payment request successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

  } catch (error) {
    console.error('❌ Payment request failed');
    console.error('Status:', error.response?.status);
    console.error('Status text:', error.response?.statusText);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server is not running. Start it with:');
      console.log('   cd backend && npm run test:basic');
    }
  }
}

testPaymentDirect();

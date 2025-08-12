const http = require('http');

console.log('🔍 Testing Server Status...');

// Test if server is running on port 5000
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    
    // Now test payment endpoint
    testPaymentEndpoint();
  });
});

req.on('error', (err) => {
  console.error('❌ Server is not running:', err.message);
  console.log('💡 Please start the backend server with:');
  console.log('   cd backend && node minimal-server.js');
});

req.end();

function testPaymentEndpoint() {
  console.log('\n🧪 Testing payment endpoint...');
  
  const paymentData = JSON.stringify({
    description: 'Test payment from script',
    amount: 5000,
    paymentMethod: 'bank_transfer'
  });
  
  const paymentOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payment/request',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(paymentData)
    }
  };
  
  const paymentReq = http.request(paymentOptions, (res) => {
    console.log(`Payment endpoint status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Payment endpoint working!');
        console.log('Response:', data);
      } else {
        console.log('❌ Payment endpoint failed');
        console.log('Response:', data);
      }
    });
  });
  
  paymentReq.on('error', (err) => {
    console.error('❌ Payment endpoint error:', err.message);
  });
  
  paymentReq.write(paymentData);
  paymentReq.end();
}

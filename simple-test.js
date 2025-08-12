const http = require('http');

console.log('🧪 Simple Backend Test');
console.log('=====================');

// Test if server is running on port 5000
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running on port 5000`);
  console.log(`   Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('   Response:', response.message);
      console.log('\n🎉 Backend server is working!');
      console.log('\n📋 Next steps:');
      console.log('   1. Open http://localhost:3000 in your browser');
      console.log('   2. Login with: test@example.com / password123');
      console.log('   3. Try adding a serial number');
    } catch (e) {
      console.log('   Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Backend server is not running');
  console.log('   Error:', err.message);
  console.log('\n📋 To start the backend server:');
  console.log('   1. Open a new terminal');
  console.log('   2. Run: cd backend && npm run test:basic');
  console.log('   3. Wait for "Server running on port 5000"');
  console.log('   4. Then try the frontend again');
});

req.end();

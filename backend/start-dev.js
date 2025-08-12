const { spawn } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();

console.log('🌞 SunX Loyalty Program - Development Startup');
console.log('============================================');

// Test MongoDB connection
async function testMongoDB() {
  try {
    console.log('🔍 Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sunx_loyalty', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log('✅ MongoDB is running and accessible');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Start the server
function startServer() {
  console.log('🚀 Starting Node.js server...');
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  return server;
}

// Main startup function
async function main() {
  const mongoRunning = await testMongoDB();
  
  if (!mongoRunning) {
    console.log('');
    console.log('⚠️  MongoDB is not running. Please start MongoDB first:');
    console.log('');
    console.log('📋 Quick Setup Options:');
    console.log('   Option 1 - Local MongoDB:');
    console.log('     • Download: https://www.mongodb.com/try/download/community');
    console.log('     • Install and run: mongod');
    console.log('');
    console.log('   Option 2 - MongoDB Atlas (Cloud):');
    console.log('     • Sign up: https://www.mongodb.com/atlas');
    console.log('     • Update MONGODB_URI in .env file');
    console.log('');
    console.log('   Option 3 - Docker:');
    console.log('     • Run: docker run -d -p 27017:27017 --name mongodb mongo');
    console.log('');
    console.log('🔄 The server will start anyway for testing, but database features won\'t work.');
    console.log('');
  }

  // Start the server regardless
  startServer();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development server...');
  process.exit(0);
});

main().catch(console.error);

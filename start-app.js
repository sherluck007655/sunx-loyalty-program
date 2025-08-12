const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🌞 SunX Loyalty Program - Application Startup');
console.log('=============================================');
console.log('');

// Check if required directories exist
const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

if (!fs.existsSync(backendDir)) {
  console.error('❌ Backend directory not found!');
  process.exit(1);
}

if (!fs.existsSync(frontendDir)) {
  console.error('❌ Frontend directory not found!');
  process.exit(1);
}

// Check if .env file exists
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.log('⚠️  .env file not found. Creating default .env file...');
  
  const defaultEnv = `# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sunx_loyalty

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Admin Configuration
ADMIN_EMAIL=admin@sunx.com
ADMIN_PASSWORD=admin123

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
`;

  fs.writeFileSync(envFile, defaultEnv);
  console.log('✅ Default .env file created');
}

console.log('📋 Starting SunX Loyalty Program...');
console.log('');

// Function to start backend
function startBackend() {
  console.log('🔧 Starting Backend Server...');
  
  const backend = spawn('npm', ['run', 'test:basic'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true
  });

  backend.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
  });

  return backend;
}

// Function to start frontend
function startFrontend() {
  console.log('🎨 Starting Frontend Development Server...');
  
  // Wait a bit for backend to start
  setTimeout(() => {
    const frontend = spawn('npm', ['start'], {
      cwd: frontendDir,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, BROWSER: 'none' } // Prevent auto-opening browser
    });

    frontend.on('error', (error) => {
      console.error('❌ Failed to start frontend:', error.message);
    });
  }, 3000);
}

// Start both servers
console.log('🚀 Starting both servers...');
console.log('');

const backendProcess = startBackend();
startFrontend();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down SunX Loyalty Program...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down SunX Loyalty Program...');
  process.exit(0);
});

// Show helpful information
setTimeout(() => {
  console.log('');
  console.log('🌐 Application URLs:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend API: http://localhost:5000/api');
  console.log('');
  console.log('👤 Test Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
  console.log('');
  console.log('🔧 Admin Credentials:');
  console.log('   Email: admin@sunx.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('📝 Note: This is running with mock data for testing');
  console.log('   To use full database features, ensure MongoDB is running');
  console.log('');
  console.log('⚠️  If you see errors, check the troubleshooting guide in README.md');
}, 5000);

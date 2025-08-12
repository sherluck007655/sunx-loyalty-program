const express = require('express');
const cors = require('cors');

console.log('🚀 Starting Minimal Payment Server...');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint called');
  res.json({
    success: true,
    message: 'Minimal server is working!',
    timestamp: new Date().toISOString()
  });
});

// Payment request endpoint
app.post('/api/payment/request', (req, res) => {
  console.log('💰 Payment request endpoint called');
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  res.json({
    success: true,
    message: 'Payment request submitted successfully',
    data: {
      payment: {
        id: 'payment-test-123',
        amount: 5000,
        description: 'Test payment request',
        status: 'pending',
        timestamp: new Date().toISOString()
      }
    }
  });
});

// Login endpoint (for testing)
app.post('/api/auth/installer/login', (req, res) => {
  console.log('🔐 Login endpoint called');
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token: 'test-token-123',
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   POST http://localhost:${PORT}/api/payment/request`);
  console.log(`   POST http://localhost:${PORT}/api/auth/installer/login`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

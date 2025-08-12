const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const installerRoutes = require('./routes/installer');
const adminRoutes = require('./routes/admin');
const serialRoutes = require('./routes/serial');
const paymentRoutes = require('./routes/payment');
const promotionRoutes = require('./routes/promotion');
const trainingRoutes = require('./routes/training');
const documentsRoutes = require('./routes/documents');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import services
const emailService = require('./services/emailService');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting (increased for development/testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for testing)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'SunX Loyalty Program API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      installer: '/api/installer',
      admin: '/api/admin',
      serial: '/api/serial',
      payment: '/api/payment',
      promotion: '/api/promotion',
      training: '/api/training',
      documents: '/api/documents'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/installer', installerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/serial', serialRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/documents', documentsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SunX Loyalty Program API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Database connection
const connectDB = async () => {
  try {
    // For testing without MongoDB, use a local fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sunx-loyalty-test';

    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create default admin if it doesn't exist
    const Admin = require('./models/Admin');
    await Admin.createDefaultAdmin();

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Please install and start MongoDB:');
    console.error('   1. Download: https://www.mongodb.com/try/download/community');
    console.error('   2. Install and start MongoDB service');
    console.error('   3. Or set MONGODB_URI in .env for cloud database');
    process.exit(1); // Exit if database connection fails
  }
};

// Start server
const PORT = process.env.PORT || 5000;

console.log('Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    console.log('✅ Database connected successfully');
    console.log('Starting HTTP server...');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`⏰ Server started at: ${new Date().toISOString()}`);
      console.log(`🌐 API available at: http://localhost:${PORT}/api`);
    });
  }).catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
} else {
  console.log('Test environment detected, not starting server');
}

module.exports = app;

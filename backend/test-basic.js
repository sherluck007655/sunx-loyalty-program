const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🧪 Basic Server Test - SunX Loyalty Program');
console.log('===========================================');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
  res.json({
    message: 'SunX Loyalty Program API - Basic Test',
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: {
      server: 'Node.js + Express',
      database: 'MongoDB (connection not tested)',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Mock auth endpoints for testing
app.post('/api/auth/installer/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        installer: {
          id: 'test-id-123',
          name: 'Test User',
          email: 'test@example.com',
          loyaltyCardId: 'SUNX-000001',
          totalPoints: 50,
          totalInverters: 5
        },
        token: 'mock-jwt-token-123'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/installer/register', (req, res) => {
  const { name, email, phone, password, cnic, address } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      installer: {
        id: 'new-user-123',
        name,
        email,
        phone,
        loyaltyCardId: 'SUNX-000002',
        totalPoints: 0,
        totalInverters: 0
      },
      token: 'mock-jwt-token-456'
    }
  });
});

// Mock installer dashboard
app.get('/api/installer/dashboard', (req, res) => {
  const totalInverters = mockSerials.length;
  const totalPoints = totalInverters * 10;
  const isEligibleForPayment = totalInverters >= 10;
  const progressPercentage = Math.min((totalInverters / 10) * 100, 100);

  // Get recent serials (last 5)
  const recentSerials = mockSerials
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(serial => ({
      _id: serial.id,
      serialNumber: serial.serialNumber,
      installationDate: serial.installationDate,
      status: serial.status
    }));

  res.json({
    success: true,
    data: {
      installer: {
        id: 'test-id-123',
        name: 'Test User',
        loyaltyCardId: 'SUNX-000001',
        totalPoints,
        totalInverters,
        isEligibleForPayment,
        progressPercentage
      },
      recentSerials,
      payments: [],
      stats: {
        totalSerials: totalInverters,
        totalPoints,
        pendingPayments: 0,
        completedPayments: 0
      }
    }
  });
});

// Mock serial number endpoints
let mockSerials = [
  {
    id: 'serial-demo-1',
    serialNumber: 'DEMO123456',
    installationDate: '2024-01-10',
    location: { address: 'Demo Location 1', city: 'Lahore' },
    inverterModel: 'SunX-5000',
    capacity: 5000,
    notes: 'Demo installation',
    status: 'active',
    createdAt: '2024-01-10T10:00:00.000Z'
  },
  {
    id: 'serial-demo-2',
    serialNumber: 'DEMO789012',
    installationDate: '2024-01-12',
    location: { address: 'Demo Location 2', city: 'Karachi' },
    inverterModel: 'SunX-3000',
    capacity: 3000,
    notes: 'Another demo installation',
    status: 'active',
    createdAt: '2024-01-12T14:30:00.000Z'
  }
];
let serialCounter = 3;

app.get('/api/serial', (req, res) => {
  console.log('📋 GET /api/serial called');
  console.log('   Query params:', req.query);
  console.log('   Current mockSerials count:', mockSerials.length);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  let filteredSerials = mockSerials;
  if (search) {
    filteredSerials = mockSerials.filter(serial =>
      serial.serialNumber.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedSerials = filteredSerials.slice(startIndex, endIndex);

  console.log('   Returning serials:', paginatedSerials.length);

  res.json({
    success: true,
    data: {
      serials: paginatedSerials,
      pagination: {
        page,
        limit,
        total: filteredSerials.length,
        totalPages: Math.ceil(filteredSerials.length / limit)
      }
    }
  });
});

app.post('/api/serial/add', (req, res) => {
  console.log('📝 POST /api/serial/add called');
  console.log('   Request body:', req.body);

  const { serialNumber, installationDate, location, inverterModel, capacity, notes } = req.body;

  // Validate required fields
  if (!serialNumber || !installationDate) {
    console.log('   ❌ Validation failed: Missing required fields');
    return res.status(400).json({
      success: false,
      message: 'Serial number and installation date are required'
    });
  }

  // Check if serial already exists
  const existingSerial = mockSerials.find(s => s.serialNumber.toUpperCase() === serialNumber.toUpperCase());
  if (existingSerial) {
    console.log('   ❌ Serial already exists:', serialNumber);
    return res.status(400).json({
      success: false,
      message: 'Serial number already registered'
    });
  }

  // Create new serial
  const newSerial = {
    id: `serial-${serialCounter++}`,
    serialNumber: serialNumber.toUpperCase(),
    installationDate,
    location: location || { address: 'Test Location', city: 'Test City' },
    inverterModel: inverterModel || 'SunX-5000',
    capacity: capacity || 5000,
    notes: notes || '',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  mockSerials.push(newSerial);
  console.log('   ✅ Serial added successfully. Total serials:', mockSerials.length);
  console.log('   New serial:', newSerial);

  res.status(201).json({
    success: true,
    message: 'Serial number added successfully',
    data: {
      serial: newSerial
    }
  });
});

app.get('/api/serial/check/:serialNumber', (req, res) => {
  const { serialNumber } = req.params;
  const exists = mockSerials.some(s => s.serialNumber.toUpperCase() === serialNumber.toUpperCase());

  res.json({
    success: true,
    data: {
      exists,
      message: exists ? 'Serial number already registered' : 'Serial number is available'
    }
  });
});

app.get('/api/serial/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalSerials: mockSerials.length,
      activeSerials: mockSerials.filter(s => s.status === 'active').length,
      thisMonth: mockSerials.filter(s => {
        const serialDate = new Date(s.createdAt);
        const now = new Date();
        return serialDate.getMonth() === now.getMonth() && serialDate.getFullYear() === now.getFullYear();
      }).length
    }
  });
});

// Mock payment endpoints
app.get('/api/payment/history', (req, res) => {
  res.json({
    success: true,
    data: {
      payments: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
      },
      summary: {
        totalEarned: 0,
        totalPending: 0,
        totalApproved: 0,
        totalRejected: 0,
        totalPayments: 0
      }
    }
  });
});

// Simple payment request endpoint
app.post('/api/payment/request', (req, res) => {
  console.log('💰 Payment request received');
  console.log('Body:', req.body);

  // Simple response
  res.json({
    success: true,
    message: 'Payment request submitted successfully',
    data: {
      payment: {
        id: 'payment-123',
        amount: 5000,
        description: 'Test payment',
        status: 'pending'
      }
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Mock installer profile endpoints
app.get('/api/installer/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      installer: {
        id: 'test-id-123',
        name: 'Test User',
        email: 'test@example.com',
        phone: '+923001234567',
        cnic: '12345-1234567-1',
        address: 'Test Address, Lahore',
        loyaltyCardId: 'SUNX-000001',
        totalPoints: mockSerials.length * 10,
        totalInverters: mockSerials.length,
        isEligibleForPayment: mockSerials.length >= 10,
        bankDetails: {
          accountTitle: 'Test User',
          accountNumber: '1234567890',
          bankName: 'Test Bank',
          branchCode: '1234'
        }
      }
    }
  });
});

app.put('/api/installer/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      installer: {
        ...req.body,
        id: 'test-id-123',
        loyaltyCardId: 'SUNX-000001'
      }
    }
  });
});

app.put('/api/installer/payment-profile', (req, res) => {
  res.json({
    success: true,
    message: 'Payment profile updated successfully',
    data: {
      bankDetails: req.body
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Basic test server running on port ${PORT}`);
  console.log(`🌐 Test it at: http://localhost:${PORT}`);
  console.log(`📋 API test: http://localhost:${PORT}/api/test`);
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password123');
  console.log('');
  console.log('⚠️  This is a basic test server with mock data');
  console.log('   Use "npm run dev" for the full application');
});

module.exports = app;

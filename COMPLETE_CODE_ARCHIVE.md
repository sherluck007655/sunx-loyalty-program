# 🌞 SunX Loyalty Program - Complete Code Archive

This file contains all the source code for the SunX Loyalty Program application. Copy each section into the appropriate file in your project structure.

## 📁 Project Structure
```
sunx-loyalty-program/
├── package.json
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   ├── server.js
│   ├── healthcheck.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Installer.js
│   │   ├── Payment.js
│   │   ├── Promotion.js
│   │   └── SerialNumber.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── installer.js
│   │   ├── payment.js
│   │   ├── promotion.js
│   │   └── serial.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── emailService.js
│   │   └── smsService.js
│   └── scripts/
│       └── seedData.js
└── frontend/
    ├── package.json
    ├── Dockerfile
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js
        ├── components/
        │   ├── AdminRoute.js
        │   ├── Layout.js
        │   ├── LoadingSpinner.js
        │   └── ProtectedRoute.js
        ├── context/
        │   ├── AuthContext.js
        │   └── ThemeContext.js
        ├── hooks/
        │   ├── useApi.js
        │   └── useLocalStorage.js
        ├── pages/
        │   ├── AdminLoginPage.js
        │   ├── LandingPage.js
        │   ├── LoginPage.js
        │   ├── NotFound.js
        │   ├── RegisterPage.js
        │   ├── admin/
        │   │   ├── Dashboard.js
        │   │   ├── Installers.js
        │   │   ├── Payments.js
        │   │   └── Promotions.js
        │   └── installer/
        │       ├── AddSerial.js
        │       ├── Dashboard.js
        │       ├── PaymentHistory.js
        │       ├── Profile.js
        │       ├── Promotions.js
        │       └── SerialNumbers.js
        ├── services/
        │   ├── adminService.js
        │   ├── api.js
        │   ├── authService.js
        │   └── installerService.js
        └── utils/
            ├── formatters.js
            └── validators.js
```

---

## 🔧 Configuration Files

### Root package.json
```json
{
  "name": "sunx-loyalty-program",
  "version": "1.0.0",
  "description": "SunX Loyalty Program Application for Installers",
  "main": "index.js",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd backend && npm run dev",
    "client": "cd frontend && npm start",
    "build": "cd frontend && npm run build",
    "install-all": "npm install && cd backend && npm install && cd ../frontend && npm install",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up",
    "docker:down": "docker-compose down"
  },
  "keywords": ["loyalty", "program", "sunx", "installers", "react", "nodejs"],
  "author": "SunX Development Team",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### .env.example
```env
# MongoDB Configuration
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

# Email Configuration (for future implementation)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (for future implementation)
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: sunx-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: sunx_loyalty
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - sunx-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sunx-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/sunx_loyalty?authSource=admin
      JWT_SECRET: your-super-secret-jwt-key-change-in-production
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - sunx-network
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: sunx-frontend
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - sunx-network
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  mongodb_data:

networks:
  sunx-network:
    driver: bridge
```

---

## 🔙 Backend Code

### backend/package.json
```json
{
  "name": "sunx-loyalty-backend",
  "version": "1.0.0",
  "description": "SunX Loyalty Program Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "keywords": ["loyalty", "api", "nodejs", "express", "mongodb"],
  "author": "SunX Development Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express-rate-limit": "^6.10.0",
    "helmet": "^7.0.0",
    "express-validator": "^7.0.1",
    "morgan": "^1.10.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  }
}
```

### backend/Dockerfile
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
```

### backend/server.js
```javascript
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

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/installer', installerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/serial', serialRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/promotion', promotionRoutes);

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
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  });
}

module.exports = app;
```

### backend/healthcheck.js
```javascript
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
```

---

## 📊 Database Models

### backend/models/Installer.js
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const installerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  cnic: {
    type: String,
    required: [true, 'CNIC is required'],
    unique: true,
    match: [/^\d{5}-\d{7}-\d{1}$/, 'Please enter a valid CNIC format (12345-1234567-1)']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },

  // Loyalty Program Information
  loyaltyCardId: {
    type: String,
    unique: true,
    required: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  totalInverters: {
    type: Number,
    default: 0
  },
  isEligibleForPayment: {
    type: Boolean,
    default: false
  },

  // Payment Information
  bankDetails: {
    accountTitle: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    bankName: {
      type: String,
      trim: true
    },
    branchCode: {
      type: String,
      trim: true
    }
  },

  // Status and Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Index for better query performance
installerSchema.index({ email: 1 });
installerSchema.index({ phone: 1 });
installerSchema.index({ loyaltyCardId: 1 });
installerSchema.index({ cnic: 1 });

// Pre-save middleware to hash password
installerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
installerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to update points and check eligibility
installerSchema.methods.updateProgress = function() {
  this.totalPoints = this.totalInverters * 10; // 10 points per inverter
  this.isEligibleForPayment = this.totalInverters >= 10;
  return this.save();
};

// Static method to generate unique loyalty card ID
installerSchema.statics.generateLoyaltyCardId = async function() {
  const count = await this.countDocuments();
  const paddedNumber = String(count + 1).padStart(6, '0');
  return `SUNX-${paddedNumber}`;
};

module.exports = mongoose.model('Installer', installerSchema);
```

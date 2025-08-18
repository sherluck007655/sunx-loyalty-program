const jwt = require('jsonwebtoken');
const Installer = require('../models/Installer');
const Admin = require('../models/Admin');

// Protect installer routes
const protectInstaller = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    console.log('❌ No token provided in request');
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    // Verify token with fallback JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);

    // Check if it's an installer token
    if (decoded.type !== 'installer') {
      console.log('❌ Invalid token type:', decoded.type);
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Installer access required.',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Get installer from MongoDB
    const installer = await Installer.findById(decoded.id);

    if (!installer) {
      console.log('❌ No installer found with ID:', decoded.id);
      return res.status(404).json({
        success: false,
        message: 'Installer account not found. Please contact support.',
        code: 'INSTALLER_NOT_FOUND'
      });
    }

    // Check if installer account is suspended or rejected
    if (installer.status === 'suspended') {
      console.log('❌ Installer account suspended:', installer.email);
      return res.status(403).json({
        success: false,
        message: 'Account has been suspended. Please contact support.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    if (installer.status === 'rejected') {
      console.log('❌ Installer account rejected:', installer.email);
      return res.status(403).json({
        success: false,
        message: 'Account application has been rejected. Please contact support.',
        code: 'ACCOUNT_REJECTED'
      });
    }

    // Allow pending users to authenticate (they'll see pending approval screen)
    // Only block if explicitly deactivated by admin
    if (installer.status === 'approved' && !installer.isActive) {
      console.log('❌ Approved installer account deactivated:', installer.email);
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    console.log('✅ Installer authenticated:', installer.email, 'Status:', installer.status);
    req.installer = installer;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please login again.',
      code: 'AUTH_FAILED'
    });
  }
};

// Protect admin routes
const protectAdmin = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token with fallback JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);

    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Get admin from MongoDB
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'No admin found with this token'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account has been deactivated'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check admin permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    if (req.admin.role === 'super_admin') {
      return next(); // Super admin has all permissions
    }

    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Require approved status for certain actions
const requireApproved = (req, res, next) => {
  if (!req.installer) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.installer.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'Account approval required to access this feature',
      code: 'APPROVAL_REQUIRED',
      data: {
        status: req.installer.status,
        message: req.installer.status === 'pending'
          ? 'Your account is pending admin approval'
          : `Account status: ${req.installer.status}`
      }
    });
  }

  next();
};

// Generate JWT token
const generateToken = (id, type) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  return jwt.sign(
    { id, type },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Optional auth: tries to read JWT if present but does not block when missing/invalid
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
      const decoded = jwt.verify(token, jwtSecret);
      // Set a minimal user object consumed by some routes
      req.user = { id: decoded.id, type: decoded.type };
    }
  } catch (e) {
    // Ignore errors and proceed unauthenticated
  } finally {
    next();
  }
};

// Generic authenticate token (non-role-specific)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = { id: decoded.id, type: decoded.type };
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = {
  protectInstaller,
  protectAdmin,
  checkPermission,
  requireApproved,
  generateToken,
  optionalAuth,
  authenticateToken
};

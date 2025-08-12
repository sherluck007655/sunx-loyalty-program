const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Installer = require('../models/Installer');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');
const {
  validateInstallerRegistration,
  validateInstallerLogin,
  validateAdminLogin
} = require('../middleware/validation-new');
const emailService = require('../services/emailService');

// @desc    Register installer
// @route   POST /api/auth/installer/register
// @access  Public
router.post('/installer/register', validateInstallerRegistration, async (req, res) => {
  try {
    const { name, email, phone, password, cnic, address } = req.body;

    console.log('🔍 Processing installer registration for:', email);

    // Check if installer already exists
    const existingInstaller = await Installer.findOne({
      $or: [{ email }, { phone }, { cnic }]
    });

    if (existingInstaller) {
      let field = 'Email';
      if (existingInstaller.phone === phone) field = 'Phone';
      if (existingInstaller.cnic === cnic) field = 'CNIC';

      return res.status(400).json({
        success: false,
        message: `${field} already registered`
      });
    }

    // Generate unique loyalty card ID
    const loyaltyCardId = await Installer.generateLoyaltyCardId();

    // Create installer with pending status (requires admin approval)
    const installer = await Installer.create({
      name,
      email,
      phone,
      password,
      cnic,
      address,
      loyaltyCardId,
      status: 'pending',
      isActive: false,
      isVerified: false
    });

    console.log('✅ Installer created successfully (pending approval):', installer.email);

    // Generate token (but installer will need approval to access features)
    const token = generateToken(installer._id, 'installer');

    // Send mock email notification
    console.log(`EMAIL: Welcome ${name}! Your loyalty card ID is ${loyaltyCardId}. Your account is pending admin approval.`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval.',
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          email: installer.email,
          phone: installer.phone,
          loyaltyCardId: installer.loyaltyCardId,
          totalPoints: installer.totalPoints,
          totalInverters: installer.totalInverters,
          status: installer.status,
          isActive: installer.isActive,
          isVerified: installer.isVerified
        },
        token,
        requiresApproval: true
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// @desc    Login installer
// @route   POST /api/auth/installer/login
// @access  Public
router.post('/installer/login', validateInstallerLogin, async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    console.log('🔍 Processing login for:', emailOrPhone);

    // Find installer by email or phone
    const installer = await Installer.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    }).select('+password');

    if (!installer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is suspended or rejected
    if (installer.status === 'suspended') {
      return res.status(401).json({
        success: false,
        message: 'Account has been suspended. Please contact support.'
      });
    }

    if (installer.status === 'rejected') {
      return res.status(401).json({
        success: false,
        message: 'Account application has been rejected. Please contact support.'
      });
    }

    // Allow pending users to login (they'll see pending approval screen)
    // Only block if explicitly deactivated by admin after approval
    if (installer.status === 'approved' && !installer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Check password
    const isMatch = await installer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    installer.lastLogin = new Date();
    await installer.save();

    // Generate token
    const token = generateToken(installer._id, 'installer');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          email: installer.email,
          phone: installer.phone,
          loyaltyCardId: installer.loyaltyCardId,
          status: installer.status,
          isActive: installer.isActive,
          isVerified: installer.isVerified,
          totalPoints: installer.totalPoints,
          totalInverters: installer.totalInverters,
          isEligibleForPayment: installer.isEligibleForPayment
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
router.post('/admin/login', validateAdminLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin in MongoDB
    let admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      // If no admin found in database, create default admin for first time setup
      if (email === 'admin@sunx.com' && password === 'admin123') {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        admin = new Admin({
          name: 'Super Admin',
          email: 'admin@sunx.com',
          password: hashedPassword,
          role: 'super_admin',
          permissions: {
            canManageInstallers: true,
            canManagePayments: true,
            canManagePromotions: true,
            canViewReports: true,
            canManageAdmins: true
          }
        });
        await admin.save();
        console.log('✅ Default admin created');
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts'
      });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      await admin.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (admin.loginAttempts > 0) {
      await admin.resetLoginAttempts();
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('🔍 Searching for user with email:', email);

    let user = null;
    let userType = null;

    // Find user (installer or admin) - try case insensitive search
    user = await Installer.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    userType = 'installer';

    console.log('📋 Installer search result:', user ? 'Found' : 'Not found');

    if (!user) {
      user = await Admin.findOne({
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      });
      userType = 'admin';
      console.log('👑 Admin search result:', user ? 'Found' : 'Not found');
    }

    if (!user) {
      console.log('❌ No user found with email:', email);
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address'
      });
    }

    console.log('✅ User found:', { email: user.email, type: userType });

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      // Send password reset email
      const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken, userType);

      if (!emailResult.success) {
        throw new Error(emailResult.error);
      }

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      console.error('Email sending failed:', error);

      // Clear reset token if email fails
      if (user.save && typeof user.save === 'function') {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put('/reset-password/:resettoken', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    console.log('🔍 Looking for reset token:', req.params.resettoken);

    // First, try to find user in MongoDB
    let user = await Installer.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    let userType = 'installer';

    if (!user) {
      user = await Admin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
      userType = 'admin';
    }

    if (!user) {
      console.log('❌ No user found with reset token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    console.log('✅ Password updated successfully:', user.email);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again.',
      error: error.message
    });
  }
});

// @desc    Update user password in frontend storage
// @route   POST /api/auth/update-frontend-password
// @access  Public (for password reset integration)
router.post('/update-frontend-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }

    console.log('🔄 Frontend password update request for:', email);

    // This endpoint is designed to be called by the frontend
    // to update its own localStorage after a successful password reset
    res.status(200).json({
      success: true,
      message: 'Password update signal sent',
      data: {
        email: email,
        action: 'update_password'
      }
    });
  } catch (error) {
    console.error('Frontend password update error:', error);
    res.status(500).json({
      success: false,
      message: 'Password update failed',
      error: error.message
    });
  }
});

module.exports = router;

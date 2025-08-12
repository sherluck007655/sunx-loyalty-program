const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Installer registration validation - SIMPLIFIED PHONE VALIDATION
const validateInstallerRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  // SIMPLE PHONE VALIDATION - ACCEPT ANY NON-EMPTY PHONE NUMBER
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('cnic')
    .matches(/^\d{5}-\d{7}-\d{1}$/)
    .withMessage('CNIC must be in format 12345-1234567-1'),
  
  body('address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  handleValidationErrors
];

// Installer login validation
const validateInstallerLogin = [
  body('emailOrPhone')
    .trim()
    .notEmpty()
    .withMessage('Email or phone is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Admin login validation
const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

module.exports = {
  validateInstallerRegistration,
  validateInstallerLogin,
  validateAdminLogin
};

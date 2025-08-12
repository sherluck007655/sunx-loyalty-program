const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Debug log
    console.log('Request body:', req.body); // Debug log
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Installer registration validation
const validateInstallerRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  // Phone validation removed - accept any phone number
  
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
    .notEmpty()
    .withMessage('Email or phone is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Serial number validation
const validateSerialNumber = [
  body('serialNumber')
    .trim()
    .matches(/^[A-Z0-9]{6,20}$/)
    .withMessage('Serial number must be 6-20 alphanumeric characters'),
  
  body('installationDate')
    .isISO8601()
    .withMessage('Please provide a valid installation date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Installation date cannot be in the future');
      }
      return true;
    }),
  
  body('location.address')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('location.city')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),

  body('inverterModel')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Inverter model cannot exceed 100 characters'),

  body('capacity')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Capacity cannot exceed 50 characters'),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Payment profile validation
const validatePaymentProfile = [
  body('accountTitle')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account title must be between 2 and 100 characters'),
  
  body('accountNumber')
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage('Account number must be between 5 and 30 characters'),
  
  body('bankName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bank name must be between 2 and 100 characters'),
  
  body('branchCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Branch code cannot exceed 20 characters'),
  
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

// Promotion validation
const validatePromotion = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('type')
    .isIn(['milestone_bonus', 'monthly_target', 'seasonal', 'special_event'])
    .withMessage('Invalid promotion type'),
  
  body('targetInverters')
    .isInt({ min: 1 })
    .withMessage('Target inverters must be at least 1'),
  
  body('bonusAmount')
    .isFloat({ min: 0 })
    .withMessage('Bonus amount must be a positive number'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateInstallerRegistration,
  validateInstallerLogin,
  validateSerialNumber,
  validatePaymentProfile,
  validateAdminLogin,
  validatePromotion,
  handleValidationErrors
};

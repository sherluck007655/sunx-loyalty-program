const { body, validationResult } = require('express-validator');

// Mock request object
const createMockReq = (body) => ({
  body,
  headers: {},
  method: 'POST',
  url: '/api/serial/add'
});

// Mock response object
const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

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

// Test data - this should match what the frontend sends
const testData = {
  serialNumber: 'ABC123XYZ',
  installationDate: new Date('2024-01-15').toISOString(),
  location: {
    address: '123 Main St',
    city: 'Karachi'
  },
  inverterModel: 'Model X',
  capacity: '5kW',
  notes: 'Test installation'
};

console.log('Testing validation with data:', testData);

// Run validation
const runValidation = async () => {
  const req = createMockReq(testData);
  const res = createMockRes();
  
  // Run each validation middleware
  for (const validator of validateSerialNumber) {
    if (typeof validator === 'function') {
      try {
        await new Promise((resolve, reject) => {
          validator(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (error) {
        console.error('Validation failed:', error);
        return;
      }
    } else {
      // This is a validation rule, run it
      await validator.run(req);
    }
  }
  
  console.log('Validation passed!');
};

runValidation().catch(console.error);

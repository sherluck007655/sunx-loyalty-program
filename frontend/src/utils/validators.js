// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Pakistani format)
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned) || /^92[0-9]{10}$/.test(cleaned);
};

// CNIC validation (Pakistani format)
export const validateCNIC = (cnic) => {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
};

// Password validation
export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    minLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
};

// Serial number validation
export const validateSerialNumber = (serialNumber) => {
  const serialRegex = /^[A-Z0-9]{6,20}$/;
  return serialRegex.test(serialNumber.toUpperCase());
};

// Required field validation
export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Minimum length validation
export const validateMinLength = (value, minLength, fieldName = 'Field') => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

// Maximum length validation
export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  if (value && value.length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  return null;
};

// Number validation
export const validateNumber = (value, fieldName = 'Field') => {
  if (value && isNaN(Number(value))) {
    return `${fieldName} must be a valid number`;
  }
  return null;
};

// Positive number validation
export const validatePositiveNumber = (value, fieldName = 'Field') => {
  const numberError = validateNumber(value, fieldName);
  if (numberError) return numberError;
  
  if (value && Number(value) <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

// Date validation
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  return null;
};

// Future date validation
export const validateFutureDate = (date, fieldName = 'Date') => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    return `${fieldName} cannot be in the past`;
  }
  return null;
};

// Past date validation
export const validatePastDate = (date, fieldName = 'Date') => {
  const dateError = validateDate(date, fieldName);
  if (dateError) return dateError;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  if (dateObj > today) {
    return `${fieldName} cannot be in the future`;
  }
  return null;
};

// Bank account number validation
export const validateBankAccount = (accountNumber) => {
  // Basic validation for Pakistani bank account numbers
  const cleaned = accountNumber.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 20;
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      const error = rule(value, field);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const validationRules = {
  required: (fieldName) => (value) => validateRequired(value, fieldName),
  email: (value) => {
    if (value && !validateEmail(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },
  phone: (value) => {
    if (value && !validatePhone(value)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },
  cnic: (value) => {
    if (value && !validateCNIC(value)) {
      return 'Please enter a valid CNIC (12345-1234567-1)';
    }
    return null;
  },
  password: (value) => {
    const validation = validatePassword(value || '');
    if (value && !validation.isValid) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  },
  serialNumber: (value) => {
    if (value && !validateSerialNumber(value)) {
      return 'Serial number must be 6-20 alphanumeric characters';
    }
    return null;
  },
  minLength: (min) => (value, fieldName) => validateMinLength(value, min, fieldName),
  maxLength: (max) => (value, fieldName) => validateMaxLength(value, max, fieldName),
  positiveNumber: (fieldName) => (value) => validatePositiveNumber(value, fieldName),
  pastDate: (fieldName) => (value) => validatePastDate(value, fieldName),
  futureDate: (fieldName) => (value) => validateFutureDate(value, fieldName)
};

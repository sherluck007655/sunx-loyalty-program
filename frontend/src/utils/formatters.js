import { format, formatDistanceToNow, isValid } from 'date-fns';

// Format currency
export const formatCurrency = (amount, currency = 'PKR') => {
  if (typeof amount !== 'number') return '0';
  
  const formatter = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
};

// Format number with commas
export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0';
  return new Intl.NumberFormat('en-PK').format(number);
};

// Format date
export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return format(dateObj, formatString);
};

// Format date and time
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValid(dateObj)) return '';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Pakistani phone numbers
  if (cleaned.startsWith('92')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  } else if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

// Format CNIC
export const formatCNIC = (cnic) => {
  if (!cnic) return '';
  
  // Remove all non-digit characters
  const cleaned = cnic.replace(/\D/g, '');
  
  // Format as 12345-1234567-1
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12)}`;
  }
  
  return cnic;
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null || typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  return `${Number(value).toFixed(decimals)}%`;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const numBytes = Number(bytes);
  const i = Math.floor(Math.log(numBytes) / Math.log(k));

  return `${parseFloat((numBytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert camelCase to Title Case
export const camelToTitle = (str) => {
  if (!str) return '';
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Format loyalty card ID
export const formatLoyaltyCardId = (cardId) => {
  if (!cardId) return '';
  
  // Add spaces for better readability: SUNX-000001 -> SUNX - 000001
  return cardId.replace(/-/, ' - ');
};

// Get status color class
export const getStatusColor = (status) => {
  const statusColors = {
    active: 'text-success-600 bg-success-50',
    inactive: 'text-gray-600 bg-gray-50',
    pending: 'text-warning-600 bg-warning-50',
    approved: 'text-primary-600 bg-primary-50',
    paid: 'text-success-600 bg-success-50',
    rejected: 'text-error-600 bg-error-50',
    cancelled: 'text-gray-600 bg-gray-50',
    completed: 'text-success-600 bg-success-50',
    maintenance: 'text-warning-600 bg-warning-50',
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-50';
};

// Get payment type display name
export const getPaymentTypeDisplay = (type) => {
  const typeNames = {
    milestone: 'Milestone Bonus',
    bonus: 'Bonus Payment',
    promotion: 'Promotion Reward',
    rebate: 'Rebate'
  };
  
  return typeNames[type] || capitalize(type);
};

// Get promotion type display name
export const getPromotionTypeDisplay = (type) => {
  const typeNames = {
    milestone_bonus: 'Milestone Bonus',
    monthly_target: 'Monthly Target',
    seasonal: 'Seasonal Promotion',
    special_event: 'Special Event'
  };
  
  return typeNames[type] || camelToTitle(type);
};

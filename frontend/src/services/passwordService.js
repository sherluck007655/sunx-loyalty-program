import { mockStorageHelpers } from './mockStorage';
import toast from 'react-hot-toast';
import api from './api';

class PasswordService {
  constructor() {
    // Initialize admin credentials if not exists
    this.initializeAdminCredentials();
  }

  // Initialize default admin credentials on first run
  initializeAdminCredentials() {
    try {
      const storedCredentials = localStorage.getItem('sunx_admin_credentials');
      if (!storedCredentials) {
        // Set up default admin credentials for first-time setup
        const defaultCredentials = {
          'admin@sunx.com': 'admin123'
        };
        localStorage.setItem('sunx_admin_credentials', JSON.stringify(defaultCredentials));
        console.log('🔧 Default admin credentials initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing admin credentials:', error);
    }
  }

  // Validate password strength
  validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Update installer password
  async updateInstallerPassword(installerId, currentPassword, newPassword) {
    try {
      console.log('🔐 Updating installer password...');

      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }

      // Call backend API to update password
      const response = await api.put('/installer/password', {
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        console.log('✅ Installer password updated successfully');
        toast.success('Password updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update password');
      }

    } catch (error) {
      console.error('❌ Error updating installer password:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update password';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Update admin password
  async updateAdminPassword(adminEmail, currentPassword, newPassword) {
    try {
      console.log('🔐 Updating admin password...');

      // Get current admin credentials from localStorage
      let adminCredentials;
      try {
        const storedCredentials = localStorage.getItem('sunx_admin_credentials');
        if (!storedCredentials) {
          // Initialize if not exists
          this.initializeAdminCredentials();
          const newStoredCredentials = localStorage.getItem('sunx_admin_credentials');
          adminCredentials = JSON.parse(newStoredCredentials);
        } else {
          adminCredentials = JSON.parse(storedCredentials);
        }
      } catch (error) {
        console.error('❌ Error accessing admin credentials:', error);
        throw new Error('Error accessing admin credentials');
      }

      // Verify current password
      if (adminCredentials[adminEmail] !== currentPassword) {
        console.log('❌ Password verification failed. Expected:', adminCredentials[adminEmail], 'Got:', currentPassword);
        throw new Error('Current password is incorrect');
      }
      
      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('. '));
      }
      
      // Update admin password (in a real app, this would be in a secure database)
      adminCredentials[adminEmail] = newPassword;
      
      // Store in localStorage for demo purposes
      localStorage.setItem('sunx_admin_credentials', JSON.stringify(adminCredentials));
      
      console.log('✅ Admin password updated successfully');
      toast.success('Password updated successfully!');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error updating admin password:', error);
      toast.error(error.message || 'Failed to update password');
      return { success: false, error: error.message };
    }
  }

  // Verify admin credentials (updated to check localStorage)
  verifyAdminCredentials(email, password) {
    try {
      // Check localStorage first
      const storedCredentials = localStorage.getItem('sunx_admin_credentials');
      let credentials;

      if (storedCredentials) {
        credentials = JSON.parse(storedCredentials);
      } else {
        // Initialize if not exists
        this.initializeAdminCredentials();
        const newStoredCredentials = localStorage.getItem('sunx_admin_credentials');
        if (newStoredCredentials) {
          credentials = JSON.parse(newStoredCredentials);
        } else {
          console.log('❌ Failed to initialize admin credentials');
          return false;
        }
      }

      console.log('🔍 Verifying admin credentials for:', email);
      console.log('🔍 Available credentials:', Object.keys(credentials));

      return credentials[email] === password;
    } catch (error) {
      console.error('Error verifying admin credentials:', error);
      return false;
    }
  }

  // Generate password strength score
  getPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');
    
    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Add uppercase letters');
    
    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Add lowercase letters');
    
    if (/\d/.test(password)) score += 20;
    else feedback.push('Add numbers');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20;
    else feedback.push('Add special characters');
    
    let strength = 'Very Weak';
    let color = 'red';
    
    if (score >= 80) {
      strength = 'Strong';
      color = 'green';
    } else if (score >= 60) {
      strength = 'Good';
      color = 'orange';
    } else if (score >= 40) {
      strength = 'Fair';
      color = 'yellow';
    } else if (score >= 20) {
      strength = 'Weak';
      color = 'red';
    }
    
    return {
      score,
      strength,
      color,
      feedback
    };
  }
}

export const passwordService = new PasswordService();

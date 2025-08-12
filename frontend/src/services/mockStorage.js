// Mock storage for payment and installer data (shared between installer and admin services)
// This simulates a database that persists data across different parts of the app
// Uses localStorage for persistence across page refreshes and logins

// Persistent storage helper with user-specific data isolation
export const STORAGE_KEYS = {
  PAYMENTS: 'sunx_mock_payments',
  INSTALLERS: 'sunx_mock_installers',
  SERIALS: 'sunx_mock_serials',
  CURRENT_USER: 'sunx_current_user'
};

export const persistentStorage = {
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  load: (key, defaultValue = []) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Get current user ID from localStorage
  getCurrentUserId: () => {
    try {
      const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const userId = currentUser ? JSON.parse(currentUser).id : null;
      return userId;
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return null;
    }
  },

  // Set current user ID in localStorage
  setCurrentUserId: (userId) => {
    try {
      const currentUser = { id: userId, loginTime: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch (error) {
      console.warn('Failed to set current user:', error);
    }
  }
};

// Initial data (used only if localStorage is empty)
const initialPayments = [
  // No initial payment data - fresh start
];

// Initial installer data (includes test installer for demo purposes)
const initialInstallers = [
  {
    id: 'installer-test-1',
    name: 'Test Installer',
    email: 'installer@test.com',
    phone: '+92-300-1234567',
    password: 'installer123', // Test password
    cnic: '12345-1234567-1',
    address: 'Test Address, Lahore',
    city: 'Lahore',
    loyaltyCardId: 'SX-001',
    status: 'approved',
    joinedAt: new Date().toISOString(),
    lastLoginAt: null,
    totalInstallations: 5,
    totalEarnings: 0,
    currentPoints: 50,
    milestones: {
      completed: 0,
      currentProgress: 5,
      totalMilestones: 0,
      lastMilestoneDate: null,
      eligibleForPayment: false
    },
    profileImage: null,
    bankDetails: {
      accountTitle: 'Test Installer',
      accountNumber: '1234567890',
      bankName: 'Test Bank',
      branchCode: '1234'
    },
    performance: {
      currentMonthInstallations: 2,
      monthlyTarget: 10,
      averageRating: 4.5,
      completionRate: 95
    }
  },
  {
    id: 'installer-test-2',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+92-300-9876543',
    password: 'password123', // Alternative test password
    cnic: '54321-7654321-2',
    address: 'Test Address 2, Karachi',
    city: 'Karachi',
    loyaltyCardId: 'SUNX-000001',
    status: 'approved',
    joinedAt: new Date().toISOString(),
    lastLoginAt: null,
    totalInstallations: 3,
    totalEarnings: 0,
    currentPoints: 30,
    milestones: {
      completed: 0,
      currentProgress: 3,
      totalMilestones: 0,
      lastMilestoneDate: null,
      eligibleForPayment: false
    },
    profileImage: null,
    bankDetails: {
      accountTitle: 'Test User',
      accountNumber: '0987654321',
      bankName: 'Demo Bank',
      branchCode: '5678'
    },
    performance: {
      currentMonthInstallations: 1,
      monthlyTarget: 10,
      averageRating: 4.0,
      completionRate: 90
    }
  }
];


// Initial serial numbers data (empty - clean slate)
const initialSerials = [
  // No initial serial data - fresh start
];





// Initial valid serial numbers (empty - clean slate)
const initialValidSerials = [
  // No initial valid serials - fresh start
];

// Initial promotions data (empty - clean slate)
const initialPromotions = [
  // No initial promotions - clean start
];



// Initial promotion participations (empty - clean slate)
const initialPromotionParticipations = [
  // No initial participation data - clean start
];



// Initial notifications (empty - no auto-notifications for new users)
const initialNotifications = [
  // No initial notifications - clean slate for new users
];

// Initialize persistent storage
export let mockPayments = persistentStorage.load(STORAGE_KEYS.PAYMENTS, initialPayments);
export let mockInstallers = persistentStorage.load(STORAGE_KEYS.INSTALLERS, initialInstallers);
export let mockSerials = persistentStorage.load(STORAGE_KEYS.SERIALS, initialSerials);
export let mockValidSerials = persistentStorage.load('sunx_valid_serials', initialValidSerials);
export let mockPromotions = persistentStorage.load('sunx_promotions', initialPromotions);
export let mockPromotionParticipations = persistentStorage.load('sunx_promotion_participations', initialPromotionParticipations);
export let mockNotifications = persistentStorage.load('sunx_notifications', initialNotifications);

// Save to localStorage whenever data changes
const saveToStorage = () => {
  persistentStorage.save(STORAGE_KEYS.PAYMENTS, mockPayments);
  persistentStorage.save(STORAGE_KEYS.INSTALLERS, mockInstallers);
  persistentStorage.save(STORAGE_KEYS.SERIALS, mockSerials);
  persistentStorage.save('sunx_valid_serials', mockValidSerials);
  persistentStorage.save('sunx_promotions', mockPromotions);
  persistentStorage.save('sunx_promotion_participations', mockPromotionParticipations);
};

// Helper functions for mock storage operations
export const mockStorageHelpers = {
  // Clear all data and start fresh
  clearAllData: () => {
    console.log('🧹 Clearing all stored data...');

    // Clear all localStorage data
    localStorage.removeItem('sunx_installers');
    localStorage.removeItem('sunx_serials');
    localStorage.removeItem('sunx_valid_serials');
    localStorage.removeItem('sunx_payments');
    localStorage.removeItem('sunx_promotions');
    localStorage.removeItem('sunx_promotion_participations');
    localStorage.removeItem('sunx_current_user');
    localStorage.removeItem('sunx_notifications');
    localStorage.removeItem('sunx_chat_conversations');
    localStorage.removeItem('sunx_chat_messages');
    localStorage.removeItem('sunx_admin_notifications');

    // Reset all arrays to empty
    mockInstallers.length = 0;
    mockSerials.length = 0;
    mockValidSerials.length = 0;
    mockPayments.length = 0;
    mockPromotions.length = 0;
    mockPromotionParticipations.length = 0;
    mockNotifications.length = 0;

    // Initialize with empty arrays
    mockInstallers.push(...initialInstallers);
    mockSerials.push(...initialSerials);
    mockValidSerials.push(...initialValidSerials);
    mockPayments.push(...initialPayments);
    mockNotifications.push(...initialNotifications);

    // Save empty data to storage
    saveToStorage();

    console.log('✅ All data cleared - fresh start with empty arrays');
    console.log('📊 Current data counts:', {
      installers: mockInstallers.length,
      serials: mockSerials.length,
      validSerials: mockValidSerials.length,
      payments: mockPayments.length,
      promotions: mockPromotions.length,
      notifications: mockNotifications.length
    });
  },

  // Clear notifications, chats, and promotions (for new user experience)
  clearNotificationsAndChats: () => {
    console.log('🧹 Clearing notifications, chat, and promotion data...');

    // Clear notification, chat, and promotion storage
    localStorage.removeItem('sunx_notifications');
    localStorage.removeItem('sunx_chat_conversations');
    localStorage.removeItem('sunx_chat_messages');
    localStorage.removeItem('sunx_admin_notifications');
    localStorage.removeItem('sunx_promotions');
    localStorage.removeItem('sunx_promotion_participations');

    // Reset arrays
    mockNotifications.length = 0;
    mockNotifications.push(...initialNotifications);
    mockPromotions.length = 0;
    mockPromotions.push(...initialPromotions);
    mockPromotionParticipations.length = 0;
    mockPromotionParticipations.push(...initialPromotionParticipations);

    // Save to storage
    saveToStorage();

    console.log('✅ Notifications, chats, and promotions cleared - clean experience for new users');
  },
  // Add new payment
  addPayment: (paymentData) => {
    // Get current user
    const currentUser = mockStorageHelpers.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const newPayment = {
      id: `payment-${Date.now()}`,
      amount: parseInt(paymentData.amount) || 50000,
      description: paymentData.description.trim(),
      paymentMethod: paymentData.paymentMethod || 'bank_transfer',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      installer: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        loyaltyCardId: currentUser.loyaltyCardId
      },
      bankDetails: {
        bankTitle: paymentData.bankTitle?.trim() || '',
        bankName: paymentData.bankName?.trim() || '',
        branchCode: paymentData.branchCode?.trim() || '',
        ibanNumber: paymentData.ibanNumber?.trim() || ''
      }
    };
    
    mockPayments.unshift(newPayment); // Add to beginning
    saveToStorage(); // Persist to localStorage
    console.log('💾 Payment added to mock storage. Total payments:', mockPayments.length);
    return newPayment;
  },

  // Get payments with filtering and pagination (user-specific)
  getPayments: (page = 1, limit = 10, status = '') => {
    // Get current user ID
    const currentUserId = persistentStorage.getCurrentUserId();
    if (!currentUserId) {
      return {
        payments: [],
        pagination: { page, limit, total: 0, pages: 0 },
        summary: { totalEarned: 0, totalPending: 0, totalApproved: 0, totalRejected: 0, totalPayments: 0 }
      };
    }

    // Filter payments by current user
    let filteredPayments = mockPayments.filter(payment => payment.installer.id === currentUserId);
    
    // Filter by status if provided
    if (status && status !== '') {
      filteredPayments = mockPayments.filter(payment => payment.status === status);
    }
    
    // Sort by creation date (newest first)
    filteredPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
    
    return {
      payments: paginatedPayments,
      pagination: {
        page,
        limit,
        total: filteredPayments.length,
        pages: Math.ceil(filteredPayments.length / limit)
      },
      summary: {
        totalPaidAmount: filteredPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
        totalPending: filteredPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        totalApproved: filteredPayments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0),
        totalRejected: filteredPayments.filter(p => p.status === 'rejected').reduce((sum, p) => sum + p.amount, 0),
        totalPayments: filteredPayments.length
      }
    };
  },

  // Update payment status (for admin)
  updatePaymentStatus: (paymentId, statusData) => {
    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex === -1) {
      throw new Error('Payment not found');
    }
    
    const payment = mockPayments[paymentIndex];
    const updatedPayment = {
      ...payment,
      status: statusData.status,
      updatedAt: new Date().toISOString()
    };
    
    // Add additional fields based on status
    if (statusData.status === 'approved') {
      updatedPayment.approvedBy = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@sunx.com'
      };
      updatedPayment.approvedAt = new Date().toISOString();
    } else if (statusData.status === 'paid') {
      updatedPayment.paidAt = new Date().toISOString();
      updatedPayment.transactionId = statusData.transactionId || `TXN-${Date.now()}`;
    } else if (statusData.status === 'rejected') {
      updatedPayment.rejectedBy = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@sunx.com'
      };
      updatedPayment.rejectedAt = new Date().toISOString();
      updatedPayment.rejectionReason = statusData.rejectionReason || statusData.reason || 'No reason provided';
    }
    
    mockPayments[paymentIndex] = updatedPayment;

    // Create notification for installer
    let notificationTitle, notificationMessage, notificationType;

    switch (statusData.status) {
      case 'approved':
        notificationType = 'payment_approved';
        notificationTitle = 'Payment Approved';
        notificationMessage = `Your payment request #${paymentId} has been approved`;
        break;
      case 'paid':
        notificationType = 'payment_paid';
        notificationTitle = 'Payment Processed';
        notificationMessage = `Your payment request #${paymentId} has been processed and paid`;
        break;
      case 'rejected':
        notificationType = 'payment_rejected';
        notificationTitle = 'Payment Rejected';
        notificationMessage = `Your payment request #${paymentId} has been rejected`;
        break;
      default:
        notificationType = 'payment_status_changed';
        notificationTitle = 'Payment Status Updated';
        notificationMessage = `Your payment request #${paymentId} status has been updated to ${statusData.status}`;
    }

    // Create notification for the installer
    mockStorageHelpers.createNotification(
      payment.installer.id,
      'installer',
      notificationType,
      notificationTitle,
      notificationMessage,
      {
        paymentId,
        amount: payment.amount,
        status: statusData.status,
        transactionId: updatedPayment.transactionId
      }
    );

    saveToStorage();
    console.log('💾 Payment status updated:', updatedPayment);
    return updatedPayment;
  },

  // Get payment by ID
  getPaymentById: (paymentId) => {
    return mockPayments.find(p => p.id === paymentId);
  },

  // Get total count
  getTotalCount: () => mockPayments.length,

  // Clear all payments (for testing)
  clearPayments: () => {
    mockPayments.length = 0;
    console.log('💾 All payments cleared from mock storage');
  },

  // Installer management functions
  getInstallers: (page = 1, limit = 10, search = '', status = '') => {
    let filteredInstallers = mockInstallers;

    // Filter by search term (name, email, loyaltyCardId)
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filteredInstallers = mockInstallers.filter(installer =>
        installer.name.toLowerCase().includes(searchLower) ||
        installer.email.toLowerCase().includes(searchLower) ||
        installer.loyaltyCardId.toLowerCase().includes(searchLower) ||
        installer.phone.includes(search)
      );
    }

    // Filter by status
    if (status && status !== '') {
      filteredInstallers = filteredInstallers.filter(installer => installer.status === status);
    }

    // Sort by join date (newest first)
    filteredInstallers.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInstallers = filteredInstallers.slice(startIndex, endIndex);

    return {
      installers: paginatedInstallers,
      pagination: {
        page,
        limit,
        total: filteredInstallers.length,
        pages: Math.ceil(filteredInstallers.length / limit)
      },
      summary: {
        totalInstallers: mockInstallers.length,
        approvedInstallers: mockInstallers.filter(i => i.status === 'approved').length,
        pendingInstallers: mockInstallers.filter(i => i.status === 'pending').length,
        rejectedInstallers: mockInstallers.filter(i => i.status === 'rejected').length,
        suspendedInstallers: mockInstallers.filter(i => i.status === 'suspended').length,
        totalInstallations: mockInstallers.reduce((sum, i) => sum + i.totalInstallations, 0),
        totalEarnings: mockInstallers.reduce((sum, i) => sum + i.totalEarnings, 0)
      }
    };
  },

  // Get installer by ID
  getInstallerById: (installerId) => {
    const installer = mockInstallers.find(i => i.id === installerId);
    if (!installer) {
      throw new Error('Installer not found');
    }
    return installer;
  },

  // Update installer status
  updateInstallerStatus: (installerId, statusData) => {
    const installerIndex = mockInstallers.findIndex(i => i.id === installerId);

    if (installerIndex === -1) {
      throw new Error('Installer not found');
    }

    const installer = mockInstallers[installerIndex];
    const updatedInstaller = {
      ...installer,
      status: statusData.status,
      updatedAt: new Date().toISOString()
    };

    // Add status change reason if provided
    if (statusData.reason) {
      updatedInstaller.statusChangeReason = statusData.reason;
      updatedInstaller.statusChangedBy = {
        id: 'admin-123',
        name: 'Admin User',
        email: 'admin@sunx.com'
      };
      updatedInstaller.statusChangedAt = new Date().toISOString();
    }

    mockInstallers[installerIndex] = updatedInstaller;
    saveToStorage(); // Persist to localStorage
    console.log('💾 Installer status updated:', updatedInstaller);
    return updatedInstaller;
  },

  // Get installer statistics
  getInstallerStats: () => {
    return {
      total: mockInstallers.length,
      approved: mockInstallers.filter(i => i.status === 'approved').length,
      pending: mockInstallers.filter(i => i.status === 'pending').length,
      rejected: mockInstallers.filter(i => i.status === 'rejected').length,
      suspended: mockInstallers.filter(i => i.status === 'suspended').length,
      totalInstallations: mockInstallers.reduce((sum, i) => sum + i.totalInstallations, 0),
      totalEarnings: mockInstallers.reduce((sum, i) => sum + i.totalEarnings, 0),
      averageRating: mockInstallers.length > 0 ?
        mockInstallers.reduce((sum, i) => sum + (i.performance?.averageRating || 0), 0) / mockInstallers.length : 0
    };
  },

  // Get all installers
  getAllInstallers: () => {
    return [...mockInstallers]; // Return a copy to prevent direct mutation
  },

  // Add new installer
  addInstaller: (installerData) => {
    // Check if email already exists
    const existingInstaller = mockInstallers.find(i => i.email === installerData.email);
    if (existingInstaller) {
      throw new Error('Email already registered');
    }

    // Check if CNIC already exists
    const existingCNIC = mockInstallers.find(i => i.cnic === installerData.cnic);
    if (existingCNIC) {
      throw new Error('CNIC already registered');
    }

    // Add to installers array
    mockInstallers.push(installerData);
    saveToStorage(); // Persist to localStorage

    console.log('💾 Installer added:', installerData);
    return installerData;
  },

  // Update installer data
  updateInstaller: (installerId, updateData) => {
    const installerIndex = mockInstallers.findIndex(i => i.id === installerId);

    if (installerIndex === -1) {
      throw new Error('Installer not found');
    }

    // Update the installer
    const updatedInstaller = {
      ...mockInstallers[installerIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    mockInstallers[installerIndex] = updatedInstaller;
    saveToStorage(); // Persist to localStorage

    console.log('💾 Installer updated:', updatedInstaller);
    return updatedInstaller;
  },

  // Delete payment (admin only)
  deletePayment: (paymentId) => {
    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
      throw new Error('Payment not found');
    }

    const deletedPayment = mockPayments.splice(paymentIndex, 1)[0];
    console.log('💾 Payment deleted:', deletedPayment);
    return deletedPayment;
  },

  // Get all serial numbers with enhanced filtering
  getAllSerials: (page = 1, limit = 10, filters = {}) => {
    let filteredSerials = [...mockSerials];

    // Filter by installer
    if (filters.installer && filters.installer !== '') {
      // This would need to be implemented based on how serials are linked to installers
      // For now, we'll filter by a mock installer field
      filteredSerials = filteredSerials.filter(serial =>
        serial.installer?.name?.toLowerCase().includes(filters.installer.toLowerCase()) ||
        serial.installer?.loyaltyCardId?.toLowerCase().includes(filters.installer.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filteredSerials = filteredSerials.filter(serial =>
        new Date(serial.installationDate) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filteredSerials = filteredSerials.filter(serial =>
        new Date(serial.installationDate) <= new Date(filters.endDate)
      );
    }

    // Filter by product/model
    if (filters.product && filters.product !== '') {
      filteredSerials = filteredSerials.filter(serial =>
        serial.inverterModel.toLowerCase().includes(filters.product.toLowerCase())
      );
    }

    // Filter by city
    if (filters.city && filters.city !== '') {
      filteredSerials = filteredSerials.filter(serial =>
        serial.location.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Sort by installation date (newest first)
    filteredSerials.sort((a, b) => new Date(b.installationDate) - new Date(a.installationDate));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSerials = filteredSerials.slice(startIndex, endIndex);

    return {
      serials: paginatedSerials,
      pagination: {
        page,
        limit,
        total: filteredSerials.length,
        pages: Math.ceil(filteredSerials.length / limit)
      },
      summary: {
        totalSerials: mockSerials.length,
        filteredCount: filteredSerials.length,
        uniqueInstallers: [...new Set(mockSerials.map(s => s.installer?.loyaltyCardId))].length,
        uniqueProducts: [...new Set(mockSerials.map(s => s.inverterModel))].length,
        uniqueCities: [...new Set(mockSerials.map(s => s.location.city))].length
      }
    };
  },

  // Delete serial number (admin only)
  deleteSerial: (serialId) => {
    const serialIndex = mockSerials.findIndex(s => s.id === serialId);
    if (serialIndex === -1) {
      throw new Error('Serial number not found');
    }

    const deletedSerial = mockSerials.splice(serialIndex, 1)[0];
    saveToStorage(); // Persist to localStorage
    console.log('💾 Serial number deleted:', deletedSerial);
    return deletedSerial;
  },

  // Get installer's payment history
  getInstallerPayments: (installerId) => {
    return mockPayments.filter(payment => payment.installer.id === installerId);
  },

  // Get installer's serial numbers
  getInstallerSerials: (installerId) => {
    return mockSerials.filter(serial => serial.installer?.id === installerId);
  },

  // Add new serial number
  addSerial: (serialData, installerId = null) => {
    // Get current user ID if not provided
    if (!installerId) {
      installerId = persistentStorage.getCurrentUserId();
      if (!installerId) {
        throw new Error('No user logged in');
      }
    }

    // Check if user is approved
    const installer = mockInstallers.find(i => i.id === installerId);
    if (!installer) {
      throw new Error('Installer not found');
    }
    if (installer.status !== 'approved') {
      throw new Error('Account must be approved by admin before adding serial numbers');
    }
    // Check if serial already exists
    const existingSerial = mockSerials.find(s =>
      s.serialNumber.toUpperCase() === serialData.serialNumber.toUpperCase()
    );

    if (existingSerial) {
      throw new Error('Serial number already registered');
    }

    // Validate serial number against admin's valid list
    if (!mockStorageHelpers.isValidSerial(serialData.serialNumber)) {
      throw new Error('Invalid serial number. This serial number is not in the approved list. Please contact admin.');
    }

    // Create new serial
    const newSerial = {
      id: `serial-${Date.now()}`,
      serialNumber: serialData.serialNumber.toUpperCase(),
      installationDate: serialData.installationDate,
      location: serialData.location || { address: 'Not specified', city: 'Not specified' },
      inverterModel: serialData.inverterModel || 'SunX-5000',
      capacity: serialData.capacity || 5000,
      notes: serialData.notes || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      installer: {
        id: installerId,
        name: installer?.name || 'Unknown',
        loyaltyCardId: installer?.loyaltyCardId || 'Unknown'
      }
    };

    // Add to mock storage
    mockSerials.push(newSerial);
    saveToStorage(); // Persist to localStorage

    console.log('💾 Serial number added to storage:', newSerial);
    console.log('💾 Total serials now:', mockSerials.length);

    return newSerial;
  },

  // Update serial number
  updateSerial: (serialId, serialData) => {
    const serialIndex = mockSerials.findIndex(s => s.id === serialId);

    if (serialIndex === -1) {
      throw new Error('Serial number not found');
    }

    // Check if new serial number already exists (if changed)
    if (serialData.serialNumber) {
      const existingSerial = mockSerials.find(s =>
        s.id !== serialId &&
        s.serialNumber.toUpperCase() === serialData.serialNumber.toUpperCase()
      );

      if (existingSerial) {
        throw new Error('Serial number already exists');
      }
    }

    // Update the serial
    const updatedSerial = {
      ...mockSerials[serialIndex],
      ...serialData,
      serialNumber: serialData.serialNumber ? serialData.serialNumber.toUpperCase() : mockSerials[serialIndex].serialNumber,
      updatedAt: new Date().toISOString()
    };

    mockSerials[serialIndex] = updatedSerial;
    saveToStorage(); // Persist to localStorage

    console.log('💾 Serial number updated:', updatedSerial);
    return updatedSerial;
  },

  // Delete serial number
  deleteSerial: (serialId) => {
    const serialIndex = mockSerials.findIndex(s => s.id === serialId);

    if (serialIndex === -1) {
      throw new Error('Serial number not found');
    }

    const deletedSerial = mockSerials.splice(serialIndex, 1)[0];
    saveToStorage(); // Persist to localStorage

    console.log('💾 Serial number deleted:', deletedSerial);
    console.log('💾 Total serials now:', mockSerials.length);

    return deletedSerial;
  },

  // Get installer dashboard data
  getInstallerDashboard: (installerId = null) => {
    // Get current user ID if not provided
    if (!installerId) {
      installerId = persistentStorage.getCurrentUserId();
      if (!installerId) {
        throw new Error('No user logged in');
      }
    }
    // Get installer info
    const installer = mockInstallers.find(i => i.id === installerId) || mockInstallers[0];

    // Get installer's payments
    const installerPayments = mockPayments.filter(p => p.installer.id === installerId);

    // Get installer's serials
    const installerSerials = mockSerials.filter(s => s.installer?.id === installerId);

    // Calculate milestone-based statistics using REAL serial count
    const totalInverters = installerSerials.length; // Use actual serial count, not hardcoded value
    const totalPoints = totalInverters * 10; // 10 points per inverter

    // Calculate milestone progress
    const completedMilestones = Math.floor(totalInverters / 10);
    const currentProgress = totalInverters % 10;
    const progressPercentage = (currentProgress / 10) * 100;

    // Check if eligible for milestone payment (completed milestone but not claimed)
    const hasUnclaimedMilestone = completedMilestones > (installer.milestones?.totalMilestones || 0);
    const isEligibleForPayment = hasUnclaimedMilestone;

    // Get recent serials (last 5)
    const recentSerials = installerSerials
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(serial => ({
        _id: serial.id,
        serialNumber: serial.serialNumber,
        installationDate: serial.installationDate,
        status: serial.status,
        inverterModel: serial.inverterModel,
        location: serial.location
      }));

    // Get recent payments (last 3)
    const recentPayments = installerPayments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3)
      .map(payment => ({
        _id: payment.id,
        amount: payment.amount,
        description: payment.description,
        status: payment.status,
        createdAt: payment.createdAt,
        paymentMethod: payment.paymentMethod
      }));

    // Calculate payment statistics
    const totalPaidAmount = installerPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPending = installerPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalApproved = installerPayments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate payment counts (not amounts)
    const pendingPayments = installerPayments.filter(p => p.status === 'pending').length;
    const approvedPayments = installerPayments.filter(p => p.status === 'approved').length;
    const paidPayments = installerPayments.filter(p => p.status === 'paid').length;

    return {
      installer: {
        id: installer.id,
        name: installer.name,
        email: installer.email,
        phone: installer.phone,
        cnic: installer.cnic,
        address: installer.address,
        loyaltyCardId: installer.loyaltyCardId,
        totalPoints: totalPoints, // Use calculated points from real serial count
        totalInverters: totalInverters, // Use actual serial count
        isEligibleForPayment,
        bankDetails: installer.bankDetails,
        status: installer.status,
        joinedAt: installer.joinedAt
      },
      stats: {
        totalInverters, // Real-time serial count
        totalSerials: totalInverters, // Alias for compatibility
        totalPoints, // Calculated from real serial count
        totalPaidAmount, // Amount paid from completed payments
        totalPending, // Amount pending in payments
        totalApproved, // Amount approved in payments
        pendingPayments, // COUNT of pending payments (not amount)
        approvedPayments, // COUNT of approved payments
        paidPayments, // COUNT of paid payments
        isEligibleForPayment,
        progressPercentage,
        currentMonthInstallations: recentSerials.length, // Use recent serials count
        monthlyTarget: installer.performance?.monthlyTarget || 10,
        averageRating: installer.performance?.averageRating || 0,
        completionRate: installer.performance?.completionRate || 0,
        milestones: {
          completed: completedMilestones,
          currentProgress: currentProgress,
          totalMilestones: installer.milestones?.totalMilestones || completedMilestones,
          progressPercentage: progressPercentage,
          nextMilestoneAt: currentProgress === 0 ? 10 : 10 - currentProgress,
          hasUnclaimedMilestone: hasUnclaimedMilestone,
          lastMilestoneDate: installer.milestones?.lastMilestoneDate
        }
      },
      recentSerials,
      recentPayments,
      notifications: [
        {
          id: 'notif-1',
          type: 'info',
          title: 'Welcome to SunX Loyalty Program',
          message: 'Start adding serial numbers to earn points and rewards!',
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          id: 'notif-2',
          type: 'success',
          title: 'Points Earned',
          message: `You have earned ${totalPoints} points from ${totalInverters} installations!`,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: false
        }
      ]
    };
  },

  // Claim milestone payment
  claimMilestonePayment: (milestoneNumber, installerId = null) => {
    // Get current user ID if not provided
    if (!installerId) {
      installerId = persistentStorage.getCurrentUserId();
      if (!installerId) {
        throw new Error('No user logged in');
      }
    }
    const installerIndex = mockInstallers.findIndex(i => i.id === installerId);

    if (installerIndex === -1) {
      throw new Error('Installer not found');
    }

    const installer = mockInstallers[installerIndex];
    const totalInverters = installer.totalInstallations;
    const completedMilestones = Math.floor(totalInverters / 10);

    // Check if milestone is valid and unclaimed
    if (milestoneNumber > completedMilestones) {
      throw new Error('Milestone not yet completed');
    }

    if (milestoneNumber <= (installer.milestones?.totalMilestones || 0)) {
      throw new Error('Milestone already claimed');
    }

    // Update installer milestone data
    const updatedInstaller = {
      ...installer,
      milestones: {
        ...installer.milestones,
        totalMilestones: milestoneNumber,
        lastMilestoneDate: new Date().toISOString(),
        eligibleForPayment: false
      }
    };

    mockInstallers[installerIndex] = updatedInstaller;
    saveToStorage(); // Persist to localStorage

    // Create milestone payment
    const milestonePayment = {
      id: `payment-milestone-${milestoneNumber}-${Date.now()}`,
      amount: 50000, // PKR 50,000 per milestone
      description: `Milestone ${milestoneNumber} Payment - ${milestoneNumber * 10} Inverter Installations`,
      status: 'pending',
      type: 'milestone',
      milestoneNumber: milestoneNumber,
      paymentMethod: 'bank_transfer',
      installer: {
        id: installer.id,
        name: installer.name,
        loyaltyCardId: installer.loyaltyCardId
      },
      createdAt: new Date().toISOString(),
      requestedBy: installer.id
    };

    mockPayments.push(milestonePayment);
    saveToStorage(); // Persist to localStorage

    console.log('💾 Milestone payment claimed:', milestonePayment);
    return {
      payment: milestonePayment,
      installer: updatedInstaller
    };
  },

  // Clear all persistent storage (for testing/reset)
  clearStorage: () => {
    persistentStorage.clear();
    console.log('💾 All persistent storage cleared');
  },

  // Reset to initial data
  resetToInitialData: () => {
    persistentStorage.clear();
    // Reinitialize with initial data
    mockPayments.length = 0;
    mockPayments.push(...initialPayments);
    mockInstallers.length = 0;
    mockInstallers.push(...initialInstallers);
    mockSerials.length = 0;
    mockSerials.push(...initialSerials);
    mockNotifications.length = 0;
    mockNotifications.push(...initialNotifications);
    saveToStorage();
    console.log('💾 Storage reset to initial data');
  },

  // Get current user info
  getCurrentUser: () => {
    const currentUserId = persistentStorage.getCurrentUserId();
    if (!currentUserId) {
      return null;
    }
    return mockInstallers.find(i => i.id === currentUserId) || null;
  },

  // Check if current user is approved
  isCurrentUserApproved: () => {
    const currentUser = mockStorageHelpers.getCurrentUser();
    return currentUser && currentUser.status === 'approved';
  },

  // Delete installer account (admin only)
  deleteInstaller: (installerId) => {
    const installerIndex = mockInstallers.findIndex(i => i.id === installerId);

    if (installerIndex === -1) {
      throw new Error('Installer not found');
    }

    const deletedInstaller = mockInstallers[installerIndex];

    // Remove installer from array
    mockInstallers.splice(installerIndex, 1);

    // Also remove all related data for this installer
    // Remove their serial numbers
    const installerSerials = mockSerials.filter(s => s.installer?.id === installerId);
    installerSerials.forEach(serial => {
      const serialIndex = mockSerials.findIndex(s => s.id === serial.id);
      if (serialIndex !== -1) {
        mockSerials.splice(serialIndex, 1);
      }
    });

    // Remove their payments
    const installerPayments = mockPayments.filter(p => p.installer.id === installerId);
    installerPayments.forEach(payment => {
      const paymentIndex = mockPayments.findIndex(p => p.id === payment.id);
      if (paymentIndex !== -1) {
        mockPayments.splice(paymentIndex, 1);
      }
    });

    // Save changes to localStorage
    saveToStorage();

    console.log('💾 Installer deleted:', deletedInstaller);
    console.log('💾 Removed serials:', installerSerials.length);
    console.log('💾 Removed payments:', installerPayments.length);

    return {
      installer: deletedInstaller,
      removedSerials: installerSerials.length,
      removedPayments: installerPayments.length
    };
  },

  // Valid Serial Numbers Management (Admin only)
  getValidSerials: () => {
    return [...mockValidSerials];
  },

  getAllValidSerials: () => {
    return [...mockValidSerials];
  },

  addValidSerials: (serialNumbers) => {
    const newSerials = serialNumbers.filter(serial => !mockValidSerials.includes(serial));
    mockValidSerials.push(...newSerials);
    saveToStorage();
    console.log('💾 Valid serials added:', newSerials.length);
    return newSerials;
  },

  removeValidSerial: (serialNumber) => {
    const index = mockValidSerials.indexOf(serialNumber);
    if (index !== -1) {
      mockValidSerials.splice(index, 1);
      saveToStorage();
      console.log('💾 Valid serial removed:', serialNumber);
      return true;
    }
    return false;
  },

  isValidSerial: (serialNumber) => {
    return mockValidSerials.includes(serialNumber.toUpperCase());
  },

  uploadValidSerials: (csvData) => {
    try {
      // Parse CSV data (simple implementation)
      const lines = csvData.split('\n');
      const serialNumbers = [];

      for (let line of lines) {
        const trimmed = line.trim().toUpperCase();
        if (trimmed && trimmed !== 'SERIAL_NUMBER') { // Skip header
          serialNumbers.push(trimmed);
        }
      }

      const addedSerials = mockStorageHelpers.addValidSerials(serialNumbers);

      return {
        total: serialNumbers.length,
        added: addedSerials.length,
        duplicates: serialNumbers.length - addedSerials.length,
        serials: addedSerials
      };
    } catch (error) {
      throw new Error('Failed to parse CSV data: ' + error.message);
    }
  },

  // Promotions Management
  getAllPromotions: () => {
    return [...mockPromotions];
  },

  getAllPromotionParticipations: () => {
    return [...mockPromotionParticipations];
  },

  getActivePromotions: () => {
    const now = new Date();
    return mockPromotions.filter(promo =>
      promo.status === 'active' &&
      new Date(promo.startDate) <= now &&
      new Date(promo.endDate) >= now
    );
  },

  getPromotionById: (promotionId) => {
    return mockPromotions.find(p => p.id === promotionId);
  },

  addPromotion: (promotionData) => {
    const newPromotion = {
      id: `promo-${Date.now()}`,
      ...promotionData,
      createdBy: {
        id: 'admin-123',
        name: 'Admin User'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockPromotions.unshift(newPromotion);

    // Create global notification for all installers
    mockStorageHelpers.createNotification(
      'all',
      'installer',
      'promotion_created',
      'New Promotion Available',
      `New promotion "${newPromotion.title}" is now available. Join now to earn bonus rewards!`,
      {
        promotionId: newPromotion.id,
        promotionTitle: newPromotion.title,
        rewardAmount: newPromotion.rewards?.amount
      }
    );

    saveToStorage();
    console.log('💾 Promotion added:', newPromotion);
    return newPromotion;
  },

  updatePromotion: (promotionId, updateData) => {
    const promotionIndex = mockPromotions.findIndex(p => p.id === promotionId);
    if (promotionIndex === -1) {
      throw new Error('Promotion not found');
    }

    mockPromotions[promotionIndex] = {
      ...mockPromotions[promotionIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    saveToStorage();
    console.log('💾 Promotion updated:', mockPromotions[promotionIndex]);
    return mockPromotions[promotionIndex];
  },

  deletePromotion: (promotionId) => {
    const promotionIndex = mockPromotions.findIndex(p => p.id === promotionId);
    if (promotionIndex === -1) {
      throw new Error('Promotion not found');
    }

    const deletedPromotion = mockPromotions.splice(promotionIndex, 1)[0];

    // Also remove all participations for this promotion
    const participationIndices = [];
    mockPromotionParticipations.forEach((participation, index) => {
      if (participation.promotionId === promotionId) {
        participationIndices.push(index);
      }
    });

    // Remove participations in reverse order to maintain indices
    participationIndices.reverse().forEach(index => {
      mockPromotionParticipations.splice(index, 1);
    });

    saveToStorage();
    console.log('💾 Promotion deleted:', deletedPromotion);
    return deletedPromotion;
  },

  // Promotion Participations Management
  getInstallerPromotions: (installerId = null) => {
    if (!installerId) {
      installerId = persistentStorage.getCurrentUserId();
      if (!installerId) {
        throw new Error('No user logged in');
      }
    }

    const activePromotions = mockStorageHelpers.getActivePromotions();
    const participations = mockPromotionParticipations.filter(p => p.installerId === installerId);

    return activePromotions.map(promotion => {
      const participation = participations.find(p => p.promotionId === promotion.id);
      let progress = null;

      if (participation) {
        progress = mockStorageHelpers.calculatePromotionProgress(promotion, installerId);
        // Auto-update participation status based on progress
        mockStorageHelpers.updatePromotionParticipationStatus(promotion.id, installerId, progress);
      }

      return {
        ...promotion,
        participation: participation || null,
        progress: progress,
        canJoin: !participation && mockStorageHelpers.isEligibleForPromotion(promotion, installerId),
        isParticipating: !!participation
      };
    });
  },

  joinPromotion: (promotionId, installerId = null) => {
    if (!installerId) {
      installerId = persistentStorage.getCurrentUserId();
      if (!installerId) {
        throw new Error('No user logged in');
      }
    }

    const promotion = mockStorageHelpers.getPromotionById(promotionId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    if (!mockStorageHelpers.isEligibleForPromotion(promotion, installerId)) {
      throw new Error('Not eligible for this promotion');
    }

    const existingParticipation = mockPromotionParticipations.find(
      p => p.promotionId === promotionId && p.installerId === installerId
    );

    if (existingParticipation) {
      throw new Error('Already participating in this promotion');
    }

    const newParticipation = {
      id: `participation-${Date.now()}`,
      promotionId,
      installerId,
      status: 'active',
      joinedAt: new Date().toISOString(),
      progress: mockStorageHelpers.calculatePromotionProgress(promotion, installerId),
      eligible: true
    };

    mockPromotionParticipations.push(newParticipation);
    saveToStorage();
    console.log('💾 Joined promotion:', newParticipation);
    return newParticipation;
  },

  calculatePromotionProgress: (promotion, installerId) => {
    if (!promotion || !installerId) {
      return { current: 0, target: 0, percentage: 0, isCompleted: false, completedAt: null };
    }

    const installer = mockInstallers.find(i => i.id === installerId);
    if (!installer) return { current: 0, target: 0, percentage: 0, isCompleted: false, completedAt: null };

    // Get participation record to check join date
    const participation = mockPromotionParticipations.find(p =>
      p.promotionId === promotion.id && p.installerId === installerId
    );

    if (!participation) {
      return { current: 0, target: 0, percentage: 0, isCompleted: false, completedAt: null };
    }

    // Only count serials added AFTER joining the promotion and DURING promotion period
    const promotionStart = new Date(promotion.startDate);
    const promotionEnd = new Date(promotion.endDate);
    const joinDate = new Date(participation.joinedAt);

    // Use the later of promotion start or join date as the counting start
    const countingStartDate = promotionStart > joinDate ? promotionStart : joinDate;

    const validSerials = mockSerials.filter(s => {
      if (s.installer?.id !== installerId) return false;

      const serialDate = new Date(s.createdAt);
      // Serial must be added after joining and within promotion period
      return serialDate >= countingStartDate && serialDate <= promotionEnd;
    });

    switch (promotion.type) {
      case 'installation_target':
        const target = promotion.target?.value || 0;
        let current = 0;

        if (promotion.target?.period === 'monthly') {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          current = validSerials.filter(s => {
            const serialDate = new Date(s.createdAt);
            return serialDate.getMonth() === currentMonth && serialDate.getFullYear() === currentYear;
          }).length;
        } else if (promotion.target?.period === 'lifetime') {
          current = validSerials.length;
        }

        const isCompleted = current >= target;
        const completedAt = isCompleted && participation.status !== 'completed' ? new Date().toISOString() : participation.completedAt;

        return {
          current,
          target,
          percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0,
          isCompleted,
          completedAt,
          validSerials: validSerials.length,
          countingStartDate: countingStartDate.toISOString()
        };

      case 'quality_target':
        const installationsTarget = promotion.target?.installations || 0;
        const ratingTarget = promotion.target?.rating || 0;
        const currentInstallations = validSerials.length;
        const currentRating = installer.performance?.averageRating || 0;
        const qualityMet = currentRating >= ratingTarget;
        const targetMet = currentInstallations >= installationsTarget;
        const isQualityCompleted = qualityMet && targetMet;
        const qualityCompletedAt = isQualityCompleted && participation.status !== 'completed' ? new Date().toISOString() : participation.completedAt;

        return {
          current: currentInstallations,
          target: installationsTarget,
          percentage: installationsTarget > 0 ? Math.min((currentInstallations / installationsTarget) * 100, 100) : 0,
          rating: currentRating,
          ratingTarget: ratingTarget,
          meetsQuality: qualityMet,
          isCompleted: isQualityCompleted,
          completedAt: qualityCompletedAt,
          validSerials: validSerials.length,
          countingStartDate: countingStartDate.toISOString()
        };

      case 'geographic_expansion':
        const citiesTarget = promotion.target?.value || 0;
        const uniqueCities = [...new Set(validSerials.map(s => s.location?.city).filter(city => city))];
        const currentCities = uniqueCities.length;
        const isGeoCompleted = currentCities >= citiesTarget;
        const geoCompletedAt = isGeoCompleted && participation.status !== 'completed' ? new Date().toISOString() : participation.completedAt;

        return {
          current: currentCities,
          target: citiesTarget,
          percentage: citiesTarget > 0 ? Math.min((currentCities / citiesTarget) * 100, 100) : 0,
          cities: uniqueCities,
          isCompleted: isGeoCompleted,
          completedAt: geoCompletedAt,
          validSerials: validSerials.length,
          countingStartDate: countingStartDate.toISOString()
        };

      default:
        return { current: 0, target: 0, percentage: 0, isCompleted: false, completedAt: null };
    }
  },

  // Update promotion participation status based on progress
  updatePromotionParticipationStatus: (promotionId, installerId, progress) => {
    const participationIndex = mockPromotionParticipations.findIndex(p =>
      p.promotionId === promotionId && p.installerId === installerId
    );

    if (participationIndex === -1) return;

    const participation = mockPromotionParticipations[participationIndex];

    // If promotion is completed and wasn't completed before
    if (progress.isCompleted && participation.status !== 'completed') {
      participation.status = 'completed';
      participation.completedAt = progress.completedAt;
      participation.progress = progress;

      // Mark reward as claimable
      participation.rewardClaimable = true;

      saveToStorage();
      console.log('💾 Promotion participation completed:', participation);
    } else if (!progress.isCompleted && participation.status === 'completed') {
      // If somehow progress went backwards (shouldn't happen but safety check)
      participation.status = 'active';
      participation.completedAt = null;
      participation.rewardClaimable = false;
      participation.progress = progress;

      saveToStorage();
      console.log('💾 Promotion participation status updated:', participation);
    } else {
      // Just update progress
      participation.progress = progress;
      saveToStorage();
    }

    return participation;
  },

  // Get detailed promotion analytics for admin
  getPromotionAnalytics: (promotionId) => {
    const promotion = mockPromotions.find(p => p.id === promotionId);
    if (!promotion) return null;

    const participations = mockPromotionParticipations.filter(p => p.promotionId === promotionId);
    const participants = participations.map(p => {
      const installer = mockInstallers.find(i => i.id === p.installerId);
      const progress = mockStorageHelpers.calculatePromotionProgress(promotion, p.installerId);

      return {
        ...p,
        installer: installer ? {
          id: installer.id,
          name: installer.name,
          email: installer.email,
          phone: installer.phone,
          city: installer.address?.city,
          status: installer.status,
          joinedAt: installer.joinedAt,
          totalInstallations: mockSerials.filter(s => s.installer?.id === installer.id).length
        } : null,
        progress
      };
    });

    const completedParticipants = participants.filter(p => p.status === 'completed');
    const activeParticipants = participants.filter(p => p.status === 'active');

    return {
      promotion,
      totalParticipants: participants.length,
      activeParticipantsCount: activeParticipants.length,
      completedParticipantsCount: completedParticipants.length,
      completionRate: participants.length > 0 ? (completedParticipants.length / participants.length) * 100 : 0,
      participants,
      completedParticipants,
      activeParticipants,
      averageProgress: participants.length > 0
        ? participants.reduce((sum, p) => sum + (p.progress?.percentage || 0), 0) / participants.length
        : 0
    };
  },

  isEligibleForPromotion: (promotion, installerId) => {
    if (!promotion || !installerId) return false;

    const installer = mockInstallers.find(i => i.id === installerId);
    if (!installer) return false;

    // Check installer status
    if (promotion.eligibility?.installerStatus && installer.status !== promotion.eligibility.installerStatus) {
      return false;
    }

    // Check minimum installations
    const installerSerials = mockSerials.filter(s => s.installer?.id === installerId);
    const minInstallations = promotion.eligibility?.minInstallations || 0;
    if (installerSerials.length < minInstallations) {
      return false;
    }

    // Check if new installers only
    if (promotion.eligibility?.newInstallersOnly) {
      const joinDate = new Date(installer.joinedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (joinDate < thirtyDaysAgo) {
        return false;
      }
    }

    return true;
  },

  // Get promotion dashboard stats for installer
  getPromotionDashboardStats: (installerId = null) => {
    if (!installerId) {
      installerId = persistentStorage.getCurrentUserId();
      if (!installerId) {
        throw new Error('No user logged in');
      }
    }

    const activePromotions = mockStorageHelpers.getActivePromotions();
    const userParticipations = mockPromotionParticipations.filter(p => p.installerId === installerId);

    return {
      availablePromotions: activePromotions.length,
      activeParticipations: userParticipations.filter(p => p.status === 'active').length,
      completedPromotions: userParticipations.filter(p => p.status === 'completed').length,
      totalRewardsEarned: userParticipations
        .filter(p => p.status === 'completed' && p.rewardClaimed)
        .reduce((sum, p) => {
          const promotion = mockStorageHelpers.getPromotionById(p.promotionId);
          return sum + (promotion?.rewards?.amount || 0);
        }, 0)
    };
  },

  // Get promotion by ID
  getPromotionById: (promotionId) => {
    return mockPromotions.find(p => p.id === promotionId) || null;
  },

  // Notification Management Functions
  createNotification: (recipientId, recipientType, type, title, message, data = {}) => {
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipientId,
      recipientType,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date().toISOString()
    };

    mockNotifications.push(notification);
    saveToStorage();
    console.log('📢 Notification created:', notification);
    return notification;
  },

  // Get notifications for a user
  getUserNotifications: (userId, userType = 'installer', limit = 50) => {
    return mockNotifications
      .filter(n => n.recipientId === userId || (n.recipientId === 'all' && n.recipientType === userType))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  },

  // Mark notification as read
  markNotificationAsRead: (notificationId, userId) => {
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification && (notification.recipientId === userId || notification.recipientId === 'all')) {
      notification.read = true;
      saveToStorage();
      return notification;
    }
    return null;
  },

  // Mark all notifications as read for a user
  markAllNotificationsAsRead: (userId, userType = 'installer') => {
    const userNotifications = mockNotifications.filter(n =>
      n.recipientId === userId || (n.recipientId === 'all' && n.recipientType === userType)
    );

    userNotifications.forEach(n => n.read = true);
    saveToStorage();
    return userNotifications.length;
  },

  // Get unread notification count
  getUnreadNotificationCount: (userId, userType = 'installer') => {
    return mockNotifications.filter(n =>
      !n.read && (n.recipientId === userId || (n.recipientId === 'all' && n.recipientType === userType))
    ).length;
  },

  // Payment Comment Management
  addPaymentComment: (paymentId, userId, userType, userName, message) => {
    const payment = mockPayments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userType,
      userName,
      message,
      createdAt: new Date().toISOString()
    };

    if (!payment.comments) {
      payment.comments = [];
    }
    payment.comments.push(comment);

    // Update payment timestamp
    payment.updatedAt = new Date().toISOString();

    saveToStorage();

    // Create notification for the other party
    if (userType === 'admin') {
      // Admin commented, notify installer
      mockStorageHelpers.createNotification(
        payment.installer.id,
        'installer',
        'payment_comment',
        'New Comment on Payment',
        `Admin has added a comment to your payment request #${paymentId}`,
        { paymentId, commentId: comment.id }
      );
    } else {
      // Installer commented, notify admin (could be all admins)
      mockStorageHelpers.createNotification(
        'admin-123', // Default admin ID
        'admin',
        'payment_comment',
        'New Comment on Payment',
        `${userName} has added a comment to payment request #${paymentId}`,
        { paymentId, commentId: comment.id, installerId: userId }
      );
    }

    console.log('💬 Payment comment added:', comment);
    return comment;
  },

  // Add receipt to payment
  addPaymentReceipt: (paymentId, receiptData) => {
    const payment = mockPayments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    const receipt = {
      ...receiptData,
      uploadedAt: new Date().toISOString()
    };

    // If it's an admin upload, it replaces any existing receipt
    // If it's an installer upload and there's already an admin receipt, keep both
    if (receiptData.uploadedBy === 'admin') {
      payment.receipt = receipt;
    } else {
      // Only set if no receipt exists or if existing receipt is not from admin
      if (!payment.receipt || payment.receipt.uploadedBy !== 'admin') {
        payment.receipt = receipt;
      }
    }

    payment.updatedAt = new Date().toISOString();
    saveToStorage();

    console.log('📎 Payment receipt added:', payment.receipt);
    return payment.receipt;
  },

  // Delete payment receipt
  deletePaymentReceipt: (paymentId) => {
    const payment = mockPayments.find(p => p.id === paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (!payment.receipt) {
      throw new Error('No receipt found to delete');
    }

    const deletedReceipt = payment.receipt;
    delete payment.receipt;
    payment.updatedAt = new Date().toISOString();
    saveToStorage();

    console.log('🗑️ Payment receipt deleted:', deletedReceipt);
    return deletedReceipt;
  },

  // Delete payment request
  deletePayment: (paymentId) => {
    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
      throw new Error('Payment not found');
    }

    const deletedPayment = mockPayments.splice(paymentIndex, 1)[0];
    saveToStorage();

    console.log('🗑️ Payment deleted:', deletedPayment);
    return deletedPayment;
  },

  // System Analytics Functions
  getSystemAnalytics: () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // User Activity Analytics
    const totalUsers = mockInstallers.length;
    const activeUsers = mockInstallers.filter(i => {
      const lastLogin = new Date(i.lastLoginAt);
      return lastLogin >= sevenDaysAgo;
    }).length;

    const newUsersThisMonth = mockInstallers.filter(i => {
      const joinDate = new Date(i.joinedAt);
      return joinDate >= thirtyDaysAgo;
    }).length;

    // Serial Number Analytics
    const totalSerials = mockSerials.length;
    const recentSerials = mockSerials.filter(s => {
      const createdDate = new Date(s.createdAt);
      return createdDate >= sevenDaysAgo;
    }).length;

    const serialsToday = mockSerials.filter(s => {
      const createdDate = new Date(s.createdAt);
      return createdDate >= oneDayAgo;
    }).length;

    // Payment Analytics
    const totalPayments = mockPayments.length;
    const pendingPayments = mockPayments.filter(p => p.status === 'pending').length;
    const approvedPayments = mockPayments.filter(p => p.status === 'approved').length;
    const totalPaymentAmount = mockPayments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Performance Metrics
    const avgSerialsPerUser = totalUsers > 0 ? (totalSerials / totalUsers).toFixed(1) : 0;
    const userGrowthRate = mockInstallers.length > 0 ?
      ((newUsersThisMonth / mockInstallers.length) * 100).toFixed(1) : 0;

    return {
      userActivity: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        userGrowthRate: parseFloat(userGrowthRate),
        activeUserPercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
      },
      serialActivity: {
        totalSerials,
        recentSerials,
        serialsToday,
        avgSerialsPerUser: parseFloat(avgSerialsPerUser),
        serialGrowthRate: totalSerials > 0 ? ((recentSerials / totalSerials) * 100).toFixed(1) : 0
      },
      paymentActivity: {
        totalPayments,
        pendingPayments,
        approvedPayments,
        totalPaymentAmount,
        avgPaymentAmount: approvedPayments > 0 ? (totalPaymentAmount / approvedPayments).toFixed(0) : 0,
        pendingPaymentPercentage: totalPayments > 0 ? ((pendingPayments / totalPayments) * 100).toFixed(1) : 0
      },
      systemHealth: {
        totalDataPoints: totalUsers + totalSerials + totalPayments,
        dataIntegrity: 100, // Mock value - in real system would check for data consistency
        systemUptime: '99.9%', // Mock value
        lastBackup: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      }
    };
  },

  // Get detailed business analytics
  getBusinessAnalytics: () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Top Performing Installers
    const topInstallers = mockInstallers
      .map(installer => {
        const installerSerials = mockSerials.filter(s => s.installer?.id === installer.id);
        const installerPayments = mockPayments.filter(p => p.installer.id === installer.id);
        const totalEarnings = installerPayments
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
          ...installer,
          serialCount: installerSerials.length,
          totalEarnings,
          efficiency: installerSerials.length > 0 ? (totalEarnings / installerSerials.length).toFixed(0) : 0
        };
      })
      .sort((a, b) => b.serialCount - a.serialCount)
      .slice(0, 5);

    // City-wise Distribution
    const cityStats = mockInstallers.reduce((acc, installer) => {
      const city = installer.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = { count: 0, serials: 0, earnings: 0 };
      }
      acc[city].count++;

      const installerSerials = mockSerials.filter(s => s.installer?.id === installer.id);
      acc[city].serials += installerSerials.length;

      const installerPayments = mockPayments.filter(p => p.installer.id === installer.id);
      const earnings = installerPayments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      acc[city].earnings += earnings;

      return acc;
    }, {});

    // Recent Activity Timeline
    const recentActivity = [];

    // Add recent registrations
    mockInstallers
      .filter(i => new Date(i.joinedAt) >= thirtyDaysAgo)
      .forEach(installer => {
        recentActivity.push({
          type: 'registration',
          timestamp: installer.joinedAt,
          description: `New installer registered: ${installer.name}`,
          user: installer.name,
          city: installer.city
        });
      });

    // Add recent serial submissions
    mockSerials
      .filter(s => new Date(s.createdAt) >= thirtyDaysAgo)
      .slice(-10) // Last 10 serials
      .forEach(serial => {
        recentActivity.push({
          type: 'serial',
          timestamp: serial.createdAt,
          description: `Serial number added: ${serial.serialNumber}`,
          user: serial.installer?.name || 'Unknown',
          city: serial.installer?.city || 'Unknown'
        });
      });

    // Add recent payments
    mockPayments
      .filter(p => new Date(p.createdAt) >= thirtyDaysAgo)
      .forEach(payment => {
        recentActivity.push({
          type: 'payment',
          timestamp: payment.createdAt,
          description: `Payment ${payment.status}: ${payment.amount} PKR`,
          user: payment.installer.name,
          city: payment.installer.city,
          amount: payment.amount
        });
      });

    // Sort by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      topInstallers,
      cityStats: Object.entries(cityStats)
        .map(([city, stats]) => ({ city, ...stats }))
        .sort((a, b) => b.count - a.count),
      recentActivity: recentActivity.slice(0, 20), // Last 20 activities
      summary: {
        totalCities: Object.keys(cityStats).length,
        avgInstallersPerCity: Object.keys(cityStats).length > 0 ?
          (mockInstallers.length / Object.keys(cityStats).length).toFixed(1) : 0,
        topCity: Object.entries(cityStats).length > 0 ?
          Object.entries(cityStats).sort((a, b) => b[1].count - a[1].count)[0][0] : 'N/A'
      }
    };
  },

  // Get time-series data for charts
  getTimeSeriesAnalytics: (days = 30) => {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Generate daily data points
    const dailyData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      // Count registrations for this day
      const registrations = mockInstallers.filter(installer => {
        const joinDate = new Date(installer.joinedAt);
        return joinDate.toISOString().split('T')[0] === dateStr;
      }).length;

      // Count serial submissions for this day
      const serials = mockSerials.filter(serial => {
        const createdDate = new Date(serial.createdAt);
        return createdDate.toISOString().split('T')[0] === dateStr;
      }).length;

      // Count payments for this day
      const payments = mockPayments.filter(payment => {
        const createdDate = new Date(payment.createdAt);
        return createdDate.toISOString().split('T')[0] === dateStr;
      }).length;

      // Calculate payment amount for this day
      const paymentAmount = mockPayments
        .filter(payment => {
          const createdDate = new Date(payment.createdAt);
          return createdDate.toISOString().split('T')[0] === dateStr && payment.status === 'approved';
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      dailyData.push({
        date: dateStr,
        registrations,
        serials,
        payments,
        paymentAmount,
        // Calculate cumulative values
        cumulativeUsers: mockInstallers.filter(i => new Date(i.joinedAt) <= date).length,
        cumulativeSerials: mockSerials.filter(s => new Date(s.createdAt) <= date).length
      });
    }

    return {
      dailyData,
      trends: {
        registrationTrend: mockStorageHelpers.calculateTrend(dailyData.map(d => d.registrations)),
        serialTrend: mockStorageHelpers.calculateTrend(dailyData.map(d => d.serials)),
        paymentTrend: mockStorageHelpers.calculateTrend(dailyData.map(d => d.payments)),
        amountTrend: mockStorageHelpers.calculateTrend(dailyData.map(d => d.paymentAmount))
      }
    };
  },

  // Calculate trend direction and percentage
  calculateTrend: (data) => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    if (firstAvg === 0 && secondAvg === 0) return { direction: 'stable', percentage: 0 };
    if (firstAvg === 0) return { direction: 'up', percentage: 100 };

    const percentage = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
    const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';

    return { direction, percentage: Math.abs(parseFloat(percentage)) };
  },

  // Update reward status for a participant
  updateRewardStatus: (participationId, newStatus, adminId = null) => {
    const participationIndex = mockPromotionParticipations.findIndex(p => p.id === participationId);
    if (participationIndex === -1) {
      throw new Error('Participation not found');
    }

    const participation = mockPromotionParticipations[participationIndex];

    // Update reward status
    participation.rewardStatus = newStatus;
    participation.rewardProcessedAt = new Date().toISOString();
    participation.rewardProcessedBy = adminId || persistentStorage.getCurrentUserId();

    // If status is paid, mark as claimed
    if (newStatus === 'paid') {
      participation.rewardClaimed = true;
      participation.rewardClaimedAt = new Date().toISOString();
    }

    // If status is rejected, unmark as claimed
    if (newStatus === 'rejected') {
      participation.rewardClaimed = false;
      participation.rewardClaimedAt = null;
    }

    saveToStorage();
    console.log('💾 Reward status updated:', participation);
    return participation;
  }
};

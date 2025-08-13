const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Installer = require('../models/Installer');
const SerialNumber = require('../models/SerialNumber');
const Payment = require('../models/Payment');
const Promotion = require('../models/Promotion');
// const Notification = require('../models/Notification');
const { protectInstaller, requireApproved } = require('../middleware/auth');
const { validatePaymentProfile } = require('../middleware/validation');

// TEST ROUTE - to verify routes are loading
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Test route working!',
    timestamp: new Date().toISOString()
  });
});

// SIMPLE NOTIFICATION TEST ROUTE
router.get('/notif-test', (req, res) => {
  res.json({
    success: true,
    message: 'Notification test route working!',
    data: { test: true }
  });
});

// @desc    Get installer profile
// @route   GET /api/installer/profile
// @access  Private (Installer)
router.get('/profile', protectInstaller, async (req, res) => {
  try {
    const installer = await Installer.findById(req.installer._id);

    res.json({
      success: true,
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          email: installer.email,
          phone: installer.phone,
          cnic: installer.cnic,
          address: installer.address,
          loyaltyCardId: installer.loyaltyCardId,
          totalPoints: installer.totalPoints,
          totalInverters: installer.totalInverters,
          isEligibleForPayment: installer.isEligibleForPayment,
          bankDetails: installer.bankDetails,
          isVerified: installer.isVerified,
          createdAt: installer.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// @desc    Update installer profile
// @route   PUT /api/installer/profile
// @access  Private (Installer)
router.put('/profile', protectInstaller, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const installer = await Installer.findByIdAndUpdate(
      req.installer._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          email: installer.email,
          phone: installer.phone,
          address: installer.address,
          loyaltyCardId: installer.loyaltyCardId
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @desc    Update payment profile
// @route   PUT /api/installer/payment-profile
// @access  Private (Installer)
router.put('/payment-profile', protectInstaller, validatePaymentProfile, async (req, res) => {
  try {
    const { accountTitle, accountNumber, bankName, branchCode } = req.body;

    const installer = await Installer.findByIdAndUpdate(
      req.installer._id,
      {
        bankDetails: {
          accountTitle,
          accountNumber,
          bankName,
          branchCode
        }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Payment profile updated successfully',
      data: {
        bankDetails: installer.bankDetails
      }
    });
  } catch (error) {
    console.error('Update payment profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment profile',
      error: error.message
    });
  }
});

// @desc    Update installer password
// @route   PUT /api/installer/password
// @access  Private (Installer)
router.put('/password', protectInstaller, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log('🔐 Update password request received');
    console.log('Request body:', req.body);
    console.log('Current password:', currentPassword);
    console.log('New password:', newPassword);
    console.log('Current password type:', typeof currentPassword);
    console.log('New password type:', typeof newPassword);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const installer = await Installer.findById(req.installer._id);

    if (!installer) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Check if installer has a password set
    if (!installer.password) {
      // If no password is set, allow setting a new password without current password validation
      console.log('⚠️ Installer has no password set, allowing password creation');
    } else {
      // Check if current password is correct
      const isCurrentPasswordValid = await installer.matchPassword(currentPassword);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
    }

    // Update password
    installer.password = newPassword;
    installer.passwordChangedAt = new Date();
    await installer.save();

    console.log(`🔑 Password updated for installer: ${installer.email}`);

    res.json({
      success: true,
      message: 'Password updated successfully',
      data: {
        passwordChangedAt: installer.passwordChangedAt
      }
    });
  } catch (error) {
    console.error('Update installer password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password',
      error: error.message
    });
  }
});

// @desc    Get installer dashboard data
// @route   GET /api/installer/dashboard
// @access  Private (Installer)
router.get('/dashboard', protectInstaller, async (req, res) => {
  try {
    // Get installer data from MongoDB
    const installer = await Installer.findById(req.installer._id);

    if (!installer) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Get recent serials with product info and payments
    const recentSerials = await SerialNumber.find({ installer: req.installer._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name model type points');

    const payments = await Payment.find({ installer: req.installer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate real-time stats
    const totalSerials = await SerialNumber.countDocuments({ installer: req.installer._id });
    const totalPoints = await SerialNumber.getInstallerTotalPoints(req.installer._id);

    const pendingPayments = await Payment.countDocuments({
      installer: req.installer._id,
      status: 'pending'
    });
    const completedPayments = await Payment.countDocuments({
      installer: req.installer._id,
      status: 'completed'
    });

    // Update installer's cached totals if they don't match real data
    if (installer.totalInverters !== totalSerials || installer.totalPoints !== totalPoints) {
      installer.totalInverters = totalSerials;
      installer.totalPoints = totalPoints;
      installer.isEligibleForPayment = totalPoints >= 1000; // Updated to use points
      await installer.save(); // Use save instead of updateProgress
    }

    // Calculate milestone progress based on points (1000 points = 1 milestone)
    const currentMilestone = Math.floor(installer.totalPoints / 1000);
    const currentProgress = installer.totalPoints % 1000;
    const progressPercentage = (currentProgress / 1000) * 100;
    const nextMilestoneAt = currentProgress === 0 ? 0 : 1000 - currentProgress;

    // Calculate total earnings and pending amounts using new PaymentRequest model
    const PaymentRequest = require('../models/PaymentRequest');
    const totalPaid = await PaymentRequest.getInstallerTotalPaid(req.installer._id);
    const pendingAmount = await PaymentRequest.getInstallerPendingAmount(req.installer._id);

    res.json({
      success: true,
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          loyaltyCardId: installer.loyaltyCardId,
          totalPoints: installer.totalPoints,
          totalInverters: installer.totalInverters,
          isEligibleForPayment: installer.totalPoints >= 1000, // Updated to use points
          progressPercentage
        },
        recentSerials: recentSerials.map(serial => ({
          id: serial._id,
          serialNumber: serial.serialNumber,
          installationDate: serial.installationDate,
          location: serial.location,
          pointsEarned: serial.pointsEarned,
          product: serial.product ? {
            name: serial.product.name,
            model: serial.product.model,
            type: serial.product.type,
            points: serial.product.points
          } : null,
          // Legacy fields for backward compatibility
          inverterModel: serial.inverterModel,
          capacity: serial.capacity,
          status: serial.status,
          createdAt: serial.createdAt
        })),
        payments,
        stats: {
          totalProducts: totalSerials, // Changed from totalInverters to totalProducts
          totalInverters: installer.totalInverters, // Keep for backward compatibility
          totalPoints: installer.totalPoints,
          totalEarnings: totalPaid.totalAmount,
          pendingPayments: pendingAmount.totalAmount,
          completedPayments,
          isEligibleForPayment: installer.totalPoints >= 1000,
          pointValue: 50, // PKR 50 per point
          currency: 'PKR',
          milestones: {
            completed: currentMilestone,
            currentProgress: currentProgress,
            progressPercentage: progressPercentage,
            nextMilestoneAt: nextMilestoneAt
          }
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// @desc    Get installer's serial numbers
// @route   GET /api/installer/serials
// @access  Private (Installer) - Requires Approval
router.get('/serials', protectInstaller, requireApproved, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const serials = await SerialNumber.find({ installer: req.installer._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SerialNumber.countDocuments({ installer: req.installer._id });

    res.json({
      success: true,
      data: {
        serials,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get serials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get serial numbers',
      error: error.message
    });
  }
});

// @desc    Get installer's payment history
// @route   GET /api/installer/payments
// @access  Private (Installer) - Requires Approval
router.get('/payments', protectInstaller, requireApproved, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ installer: req.installer._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('promotionId', 'title description');

    const total = await Payment.countDocuments({ installer: req.installer._id });

    // Calculate totals
    const totalEarned = await Payment.aggregate([
      { $match: { installer: req.installer._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPending = await Payment.aggregate([
      { $match: { installer: req.installer._id, status: { $in: ['pending', 'approved'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalEarned: totalEarned[0]?.total || 0,
          totalPending: totalPending[0]?.total || 0,
          totalPayments: total
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// Payment request route moved to /api/payment/request for consistency
// This route is deprecated - use /api/payment/request instead

// @desc    Get payment stats
// @route   GET /api/installer/payment/stats
// @access  Private (Installer) - Requires Approval
router.get('/payment/stats', protectInstaller, requireApproved, async (req, res) => {
  try {
    const installer = await Installer.findById(req.installer._id);

    const totalPaid = await Payment.aggregate([
      { $match: { installer: installer._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingAmount = await Payment.aggregate([
      { $match: { installer: installer._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalProducts = await SerialNumber.countDocuments({ installer: installer._id });
    const totalPoints = await SerialNumber.getInstallerTotalPoints(installer._id);
    const eligibleForPayment = totalPoints >= 1000;

    // Use PaymentRequest model for accurate payment tracking
    const PaymentRequest = require('../models/PaymentRequest');
    const paidStats = await PaymentRequest.getInstallerTotalPaid(installer._id);
    const pendingStats = await PaymentRequest.getInstallerPendingAmount(installer._id);

    res.json({
      success: true,
      data: {
        totalPaid: paidStats.totalAmount,
        pendingAmount: pendingStats.totalAmount,
        totalProducts, // Changed from totalInverters
        totalInverters: totalProducts, // Keep for backward compatibility
        totalPoints,
        eligibleForPayment,
        pointValue: 50, // PKR 50 per point
        currency: 'PKR'
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment stats',
      error: error.message
    });
  }
});

// @desc    Get active promotions
// @route   GET /api/installer/promotions/active
// @access  Private (Installer) - Requires Approval
router.get('/promotions/active', protectInstaller, requireApproved, async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      isVisible: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ priority: -1, createdAt: -1 });

    console.log(`📊 Found ${promotions.length} active promotions for installer ${req.installer.email}`);

    // Add participation status and eligibility for each promotion
    const promotionsWithStatus = promotions.map(promotion => {
      // Check if installer is already participating
      const participant = promotion.participants.find(
        p => p.installer.toString() === req.installer._id.toString()
      );

      const isParticipating = !!participant;
      const isCompleted = participant ? participant.isCompleted : false;
      const currentProgress = participant ? participant.currentProgress : 0;

      // Check eligibility
      const meetsMinRequirement = req.installer.totalInverters >= (promotion.eligibilityCriteria.minExistingInverters || 0);
      const notExcluded = !promotion.eligibilityCriteria.excludedInstallers.includes(req.installer._id);
      const hasSpace = !promotion.eligibilityCriteria.maxParticipants ||
                      promotion.participants.length < promotion.eligibilityCriteria.maxParticipants;

      const canJoin = !isParticipating && meetsMinRequirement && notExcluded && hasSpace;

      return {
        _id: promotion._id,
        title: promotion.title,
        description: promotion.description,
        type: promotion.type,
        targetInverters: promotion.targetInverters,
        bonusAmount: promotion.bonusAmount,
        currency: promotion.currency,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        priority: promotion.priority,
        eligibilityCriteria: promotion.eligibilityCriteria,

        // Participation status
        isParticipating,
        canJoin,
        isCompleted,
        currentProgress,
        progressPercentage: isParticipating ? Math.min((currentProgress / promotion.targetInverters) * 100, 100) : 0,

        // Additional info
        participantCount: promotion.participants.length,
        daysRemaining: Math.max(0, Math.ceil((promotion.endDate - now) / (1000 * 60 * 60 * 24)))
      };
    });

    console.log(`✅ Processed promotions - Available: ${promotionsWithStatus.filter(p => p.canJoin).length}, Participating: ${promotionsWithStatus.filter(p => p.isParticipating).length}`);

    res.json({
      success: true,
      data: {
        promotions: promotionsWithStatus,
        installerInfo: {
          totalInverters: req.installer.totalInverters,
          email: req.installer.email
        }
      }
    });
  } catch (error) {
    console.error('Get active promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active promotions',
      error: error.message
    });
  }
});

// @desc    Get promotion dashboard stats
// @route   GET /api/installer/promotions/stats
// @access  Private (Installer) - Requires Approval
router.get('/promotions/stats', protectInstaller, requireApproved, async (req, res) => {
  try {
    // Get active promotions count
    const now = new Date();
    const activePromotions = await Promotion.countDocuments({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    // Get installer's participation count
    const participatingPromotions = await Promotion.countDocuments({
      participants: req.installer._id,
      isActive: true
    });

    // Get completed promotions count
    const completedPromotions = await Promotion.countDocuments({
      participants: req.installer._id,
      endDate: { $lt: now }
    });

    res.json({
      success: true,
      data: {
        activePromotions,
        participatingPromotions,
        completedPromotions,
        availablePromotions: activePromotions - participatingPromotions
      }
    });
  } catch (error) {
    console.error('Get promotion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get promotion stats',
      error: error.message
    });
  }
});

// @desc    Get promotion details
// @route   GET /api/installer/promotions/:id
// @access  Private (Installer)
router.get('/promotions/:id', protectInstaller, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Find participant data for this installer
    const participant = promotion.participants.find(
      p => p.installer.toString() === req.installer._id.toString()
    );

    // Check if installer is participating
    const isParticipating = !!participant;
    const currentProgress = participant ? participant.currentProgress : 0;
    const isCompleted = participant ? participant.isCompleted : false;
    const progressPercentage = isParticipating
      ? Math.min((currentProgress / promotion.targetInverters) * 100, 100)
      : 0;

    const promotionData = {
      _id: promotion._id,
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      targetInverters: promotion.targetInverters,
      bonusAmount: promotion.bonusAmount,
      currency: promotion.currency,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      bannerImage: promotion.bannerImage,
      isCurrentlyActive: promotion.isCurrentlyActive,
      daysRemaining: Math.max(0, Math.ceil((promotion.endDate - new Date()) / (1000 * 60 * 60 * 24))),
      totalParticipants: promotion.participants.length,

      // Participant-specific data
      isParticipating,
      currentProgress,
      isCompleted,
      joinedAt: participant ? participant.joinedAt : null,
      completedAt: participant ? participant.completedAt : null,
      progressPercentage,
      eligibilityCriteria: promotion.eligibilityCriteria
    };

    res.json({
      success: true,
      data: { promotion: promotionData }
    });
  } catch (error) {
    console.error('Get promotion details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get promotion details',
      error: error.message
    });
  }
});

// @desc    Join promotion
// @route   POST /api/installer/promotions/:id/join
// @access  Private (Installer) - Requires Approval
router.post('/promotions/:id/join', protectInstaller, requireApproved, async (req, res) => {
  try {
    console.log(`🎯 Installer ${req.installer.email} attempting to join promotion ${req.params.id}`);

    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      console.log('❌ Promotion not found');
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    console.log(`📋 Promotion found: ${promotion.title}`);

    if (!promotion.isActive) {
      console.log('❌ Promotion is not active');
      return res.status(400).json({
        success: false,
        message: 'Promotion is not active'
      });
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      console.log('❌ Promotion is not currently running');
      return res.status(400).json({
        success: false,
        message: 'Promotion is not currently running'
      });
    }

    // Check if installer already joined (correct way to check participants array)
    const existingParticipant = promotion.participants.find(
      p => p.installer.toString() === req.installer._id.toString()
    );

    if (existingParticipant) {
      console.log('❌ Installer already joined this promotion');
      return res.status(400).json({
        success: false,
        message: 'You have already joined this promotion'
      });
    }

    // Check eligibility criteria
    const meetsMinRequirement = req.installer.totalInverters >= (promotion.eligibilityCriteria.minExistingInverters || 0);
    if (!meetsMinRequirement) {
      console.log(`❌ Installer doesn't meet minimum requirement: ${req.installer.totalInverters} < ${promotion.eligibilityCriteria.minExistingInverters}`);
      return res.status(400).json({
        success: false,
        message: `You need at least ${promotion.eligibilityCriteria.minExistingInverters} existing inverters to join this promotion`
      });
    }

    // Check if installer is excluded
    const isExcluded = promotion.eligibilityCriteria.excludedInstallers.includes(req.installer._id);
    if (isExcluded) {
      console.log('❌ Installer is excluded from this promotion');
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for this promotion'
      });
    }

    // Check participant limit
    if (promotion.eligibilityCriteria.maxParticipants &&
        promotion.participants.length >= promotion.eligibilityCriteria.maxParticipants) {
      console.log('❌ Promotion has reached maximum participants');
      return res.status(400).json({
        success: false,
        message: 'This promotion has reached its maximum number of participants'
      });
    }

    // Use the model's addParticipant method to properly add the installer
    await promotion.addParticipant(req.installer._id);

    // Update participant progress with current inverter count
    await promotion.updateParticipantProgress(req.installer._id, req.installer.totalInverters || 0);

    console.log(`✅ Successfully added installer to promotion: ${promotion.title}`);

    res.json({
      success: true,
      message: 'Successfully joined promotion!',
      data: {
        promotion: {
          id: promotion._id,
          title: promotion.title,
          targetInverters: promotion.targetInverters,
          bonusAmount: promotion.bonusAmount,
          currentProgress: req.installer.totalInverters || 0
        }
      }
    });
  } catch (error) {
    console.error('Join promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join promotion',
      error: error.message
    });
  }
});

// @desc    Get promotion history
// @route   GET /api/installer/promotions/history
// @access  Private (Installer) - Requires Approval
router.get('/promotions/history', protectInstaller, requireApproved, async (req, res) => {
  try {
    const promotions = await Promotion.find({
      participants: req.installer._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { promotions }
    });
  } catch (error) {
    console.error('Get promotion history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get promotion history',
      error: error.message
    });
  }
});

// @desc    Get installer notifications
// @route   GET /api/installer/notifications
// @access  Private (Installer)
router.get('/notifications', protectInstaller, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    let notifications = [];
    let unreadCount = 0;
    let total = 0;

    // Get notifications from MongoDB
    try {
      // For now, return mock data since Notification model might not be fully implemented
      notifications = [
        {
          _id: 'notif-1',
          type: 'payment_approved',
          title: 'Payment Approved! 🎉',
          message: 'Your payment request for PKR 5,000 has been approved.',
          read: false,
          createdAt: new Date().toISOString(),
          data: {
            amount: 5000,
            actionUrl: '/payments'
          }
        },
        {
          _id: 'notif-2',
          type: 'promotion_created',
          title: 'New Promotion Available! 🎁',
          message: 'A new promotion is now available. Join now to earn extra rewards!',
          read: false,
          createdAt: new Date(Date.now() - 60000).toISOString(),
          data: {
            actionUrl: '/promotions'
          }
        }
      ];
      unreadCount = 2;
      total = 2;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      notifications = [];
      unreadCount = 0;
      total = 0;
    }

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/installer/notifications/:id/read
// @access  Private (Installer)
router.put('/notifications/:id/read', protectInstaller, async (req, res) => {
  try {
    // For now, return mock response since Notification model might not be fully implemented
    const notification = {
      _id: req.params.id,
      read: true,
      readAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/installer/notifications/read-all
// @access  Private (Installer)
router.put('/notifications/read-all', protectInstaller, async (req, res) => {
  try {
    // For now, return mock response since Notification model might not be fully implemented
    const modifiedCount = 2;

    res.json({
      success: true,
      message: `Marked ${modifiedCount} notifications as read`,
      data: {
        modifiedCount
      }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

module.exports = router;

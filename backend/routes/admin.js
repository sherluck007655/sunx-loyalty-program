const express = require('express');
const router = express.Router();
const Installer = require('../models/Installer');
const Payment = require('../models/Payment');
const Promotion = require('../models/Promotion');
const SerialNumber = require('../models/SerialNumber');
const ValidSerial = require('../models/ValidSerial');
const Admin = require('../models/Admin');
const { protectAdmin, checkPermission } = require('../middleware/auth');
const { validatePromotion } = require('../middleware/validation');

// Import admin sub-routes
const adminTrainingRoutes = require('./admin/training');
// const adminDocumentsRoutes = require('./admin/documents'); // Temporarily disabled

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', protectAdmin, async (req, res) => {
  try {
    console.log('🔍 Admin dashboard: Fetching comprehensive stats...');

    // Get comprehensive installer statistics
    const totalInstallers = await Installer.countDocuments();
    const approvedInstallers = await Installer.countDocuments({ status: 'approved' });
    const pendingInstallers = await Installer.countDocuments({ status: 'pending' });
    const rejectedInstallers = await Installer.countDocuments({ status: 'rejected' });
    const suspendedInstallers = await Installer.countDocuments({ status: 'suspended' });
    const activeInstallers = await Installer.countDocuments({ isActive: true });

    // Get installation/serial statistics
    const totalSerials = await SerialNumber.countDocuments();
    const recentSerials = await SerialNumber.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });
    const uniqueProducts = await SerialNumber.distinct('inverterModel').then(arr => arr.length);
    const uniqueCities = await SerialNumber.distinct('location.city').then(arr => arr.filter(city => city).length);

    // Get payment statistics
    const totalPayments = await Payment.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const approvedPayments = await Payment.countDocuments({ status: 'approved' });
    const paidPayments = await Payment.countDocuments({ status: 'paid' });

    // Get payment amounts
    const paymentAmounts = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalAmount = 0, pendingAmount = 0, paidAmount = 0;
    paymentAmounts.forEach(item => {
      totalAmount += item.totalAmount;
      if (item._id === 'pending') pendingAmount = item.totalAmount;
      if (item._id === 'paid') paidAmount = item.totalAmount;
    });

    // Get promotion statistics
    const totalPromotions = await Promotion.countDocuments();
    const activePromotions = await Promotion.countDocuments({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    const expiredPromotions = await Promotion.countDocuments({
      endDate: { $lt: new Date() }
    });

    // Get recent activities
    const recentInstallers = await Installer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email loyaltyCardId totalInverters createdAt');

    const recentSerialsData = await SerialNumber.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('installer', 'name loyaltyCardId')
      .select('serialNumber installationDate installer createdAt');

    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('installer', 'name loyaltyCardId')
      .select('amount status description installer createdAt');

    // Get monthly statistics
    const monthlyStats = await SerialNumber.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get payment statistics
    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate growth rates and averages
    const averagePerInstaller = totalInstallers > 0 ? Math.round(totalSerials / totalInstallers) : 0;
    const averagePaymentAmount = totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0;
    const pendingPaymentPercentage = totalPayments > 0 ? Math.round((pendingPayments / totalPayments) * 100) : 0;

    console.log('✅ Admin dashboard: Stats calculated successfully');

    // Return comprehensive dashboard data
    res.json({
      success: true,
      data: {
        // Main stats for dashboard cards
        installers: {
          total: totalInstallers,
          approved: approvedInstallers,
          pending: pendingInstallers,
          rejected: rejectedInstallers,
          suspended: suspendedInstallers,
          growthRate: 0 // Could be calculated with historical data
        },
        installations: {
          total: totalSerials,
          recent: recentSerials,
          averagePerInstaller: averagePerInstaller
        },
        payments: {
          total: totalPayments,
          pending: pendingPayments,
          approved: approvedPayments,
          paid: paidPayments,
          totalAmount: totalAmount,
          pendingAmount: pendingAmount,
          paidAmount: paidAmount
        },
        serials: {
          total: totalSerials,
          recent: recentSerials,
          uniqueProducts: uniqueProducts,
          uniqueCities: uniqueCities
        },
        promotions: {
          active: activePromotions,
          total: totalPromotions,
          expired: expiredPromotions
        },
        overview: {
          totalPaidAmount: paidAmount,
          averageRating: 4.2, // Could be calculated from feedback
          totalSerials: totalSerials,
          totalProducts: uniqueProducts,
          totalCities: uniqueCities,
          systemHealth: totalSerials > 50 ? 'excellent' : totalSerials > 20 ? 'good' : 'fair',
          lastUpdated: new Date().toISOString()
        },
        // Legacy format for backward compatibility
        stats: {
          totalInstallers,
          activeInstallers,
          totalSerials,
          pendingPayments,
          activePromotions
        },
        recentActivities: {
          installers: recentInstallers,
          serials: recentSerialsData,
          payments: recentPayments
        },
        charts: {
          monthlyInstallations: monthlyStats,
          paymentBreakdown: paymentStats
        }
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// @desc    Get all installers
// @route   GET /api/admin/installers
// @access  Private (Admin)
router.get('/installers', protectAdmin, checkPermission('canManageInstallers'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { loyaltyCardId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.isActive = status === 'active';
    }

    const installers = await Installer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await Installer.countDocuments(query);

    // Get summary statistics for the installers page
    const totalInstallers = await Installer.countDocuments();
    const approvedInstallers = await Installer.countDocuments({ status: 'approved' });
    const pendingInstallers = await Installer.countDocuments({ status: 'pending' });
    const rejectedInstallers = await Installer.countDocuments({ status: 'rejected' });
    const activeInstallers = await Installer.countDocuments({ isActive: true });

    console.log('📊 Installers summary stats:', {
      totalInstallers,
      approvedInstallers,
      pendingInstallers,
      rejectedInstallers,
      activeInstallers
    });

    res.json({
      success: true,
      data: {
        installers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalInstallers: totalInstallers,
          total: totalInstallers,
          approved: approvedInstallers,
          pending: pendingInstallers,
          rejected: rejectedInstallers,
          active: activeInstallers
        }
      }
    });
  } catch (error) {
    console.error('Get installers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get installers',
      error: error.message
    });
  }
});

// @desc    Get installer details
// @route   GET /api/admin/installers/:id
// @access  Private (Admin)
router.get('/installers/:id', protectAdmin, checkPermission('canManageInstallers'), async (req, res) => {
  try {
    const installer = await Installer.findById(req.params.id).select('-password');
    
    if (!installer) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Get installer's serial numbers
    const serials = await SerialNumber.find({ installer: installer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get installer's payments
    const payments = await Payment.find({ installer: installer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        installer,
        serials,
        payments
      }
    });
  } catch (error) {
    console.error('Get installer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get installer details',
      error: error.message
    });
  }
});

// @desc    Update installer status
// @route   PUT /api/admin/installers/:id/status
// @access  Private (Admin)
router.put('/installers/:id/status', protectAdmin, checkPermission('canManageInstallers'), async (req, res) => {
  try {
    const { status, reason } = req.body;

    const installer = await Installer.findById(req.params.id);

    if (!installer) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Update status based on the new status system
    switch (status) {
      case 'approved':
        installer.isActive = true;
        installer.isVerified = true;
        installer.status = 'approved';
        break;
      case 'rejected':
        installer.isActive = false;
        installer.isVerified = false;
        installer.status = 'rejected';
        break;
      case 'suspended':
        installer.isActive = false;
        installer.status = 'suspended';
        break;
      case 'pending':
        installer.isActive = false;
        installer.isVerified = false;
        installer.status = 'pending';
        break;
      default:
        // Legacy support for boolean values
        if (typeof req.body.isActive === 'boolean') {
          installer.isActive = req.body.isActive;
        }
        if (typeof req.body.isVerified === 'boolean') {
          installer.isVerified = req.body.isVerified;
        }
    }

    // Add status change reason if provided
    if (reason) {
      installer.statusReason = reason;
      installer.statusChangedAt = new Date();
    }

    await installer.save();

    res.json({
      success: true,
      message: 'Installer status updated successfully',
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          isActive: installer.isActive,
          isVerified: installer.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Update installer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update installer status',
      error: error.message
    });
  }
});

// @desc    Generate new password for installer (Admin only)
// @route   POST /api/admin/installers/:id/reset-password
// @access  Private (Admin)
router.post('/installers/:id/reset-password', protectAdmin, checkPermission('canManageInstallers'), async (req, res) => {
  try {
    const installer = await Installer.findById(req.params.id);

    if (!installer) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Generate a new temporary password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

    // Update the installer's password
    installer.password = newPassword;
    installer.passwordChangedAt = new Date();
    await installer.save();

    console.log(`🔑 Password reset for installer ${installer.email}: ${newPassword}`);

    res.json({
      success: true,
      message: 'New password generated successfully',
      data: {
        newPassword: newPassword,
        installerName: installer.name,
        installerEmail: installer.email,
        resetAt: installer.passwordChangedAt
      }
    });
  } catch (error) {
    console.error('Reset installer password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset installer password',
      error: error.message
    });
  }
});

// @desc    Update installer profile
// @route   PUT /api/admin/installers/:id
// @access  Private (Admin)
router.put('/installers/:id', protectAdmin, checkPermission('canManageInstallers'), async (req, res) => {
  try {
    const { name, email, phone, cnic, address, city, bankDetails } = req.body;

    const installer = await Installer.findById(req.params.id);

    if (!installer) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Update fields if provided
    if (name) installer.name = name;
    if (email) installer.email = email;
    if (phone) installer.phone = phone;
    if (cnic) installer.cnic = cnic;
    if (address) installer.address = address;
    if (city) installer.city = city;
    if (bankDetails) installer.bankDetails = { ...installer.bankDetails, ...bankDetails };

    await installer.save();

    res.json({
      success: true,
      message: 'Installer profile updated successfully',
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          email: installer.email,
          phone: installer.phone,
          cnic: installer.cnic,
          address: installer.address,
          city: installer.city,
          bankDetails: installer.bankDetails
        }
      }
    });
  } catch (error) {
    console.error('Update installer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update installer profile',
      error: error.message
    });
  }
});

// @desc    Delete installer account
// @route   DELETE /api/admin/installers/:id
// @access  Private (Admin)
router.delete('/installers/:id', protectAdmin, checkPermission('canManageInstallers'), async (req, res) => {
  try {
    const installer = await Installer.findById(req.params.id);

    if (!installer) {
      return res.status(404).json({
        success: false,
        message: 'Installer not found'
      });
    }

    // Delete related data
    await SerialNumber.deleteMany({ installer: installer._id });
    await Payment.deleteMany({ installer: installer._id });

    // Delete the installer
    await Installer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Installer account and all related data deleted successfully',
      data: {
        installer: {
          id: installer._id,
          name: installer.name,
          email: installer.email
        }
      }
    });
  } catch (error) {
    console.error('Delete installer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete installer account',
      error: error.message
    });
  }
});

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private (Admin)
router.get('/payments', protectAdmin, checkPermission('canManagePayments'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status && ['pending', 'approved', 'paid', 'rejected'].includes(status)) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('installer', 'name email loyaltyCardId phone')
      .populate('promotionId', 'title description')
      .populate('approvedBy', 'name email');

    const total = await Payment.countDocuments(query);

    // Transform payments to include id field for frontend compatibility
    const transformedPayments = payments.map(payment => {
      const paymentObj = payment.toObject();
      paymentObj.id = paymentObj._id.toString();
      return paymentObj;
    });

    res.json({
      success: true,
      data: {
        payments: transformedPayments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
});

// @desc    Approve/Reject payment
// @route   PUT /api/admin/payments/:id/status
// @access  Private (Admin)
router.put('/payments/:id/status', protectAdmin, checkPermission('canManagePayments'), async (req, res) => {
  try {
    const { status, rejectionReason, transactionId } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (status === 'approved') {
      await payment.approve(req.admin._id);

      // Create notification for installer
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientId: payment.installer,
        recipientType: 'installer',
        type: 'payment_approved',
        title: 'Payment Request Approved',
        message: `Your payment request for ${payment.currency} ${payment.amount} has been approved and will be processed soon.`,
        data: {
          paymentId: payment._id,
          amount: payment.amount,
          currency: payment.currency
        }
      });

    } else if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }
      await payment.reject(req.admin._id, rejectionReason);

      // Create notification for installer
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientId: payment.installer,
        recipientType: 'installer',
        type: 'payment_rejected',
        title: 'Payment Request Rejected',
        message: `Your payment request for ${payment.currency} ${payment.amount} has been rejected. Reason: ${rejectionReason}`,
        data: {
          paymentId: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          rejectionReason: rejectionReason
        }
      });

    } else if (status === 'paid') {
      await payment.markAsPaid(transactionId);

      // Create notification for installer
      const Notification = require('../models/Notification');
      await Notification.create({
        recipientId: payment.installer,
        recipientType: 'installer',
        type: 'payment_paid',
        title: 'Payment Completed',
        message: `Your payment of ${payment.currency} ${payment.amount} has been successfully processed. Transaction ID: ${transactionId}`,
        data: {
          paymentId: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          transactionId: transactionId
        }
      });
    }

    const updatedPayment = await Payment.findById(payment._id)
      .populate('installer', 'name email loyaltyCardId')
      .populate('approvedBy', 'name email');

    res.json({
      success: true,
      message: `Payment ${status} successfully`,
      data: {
        payment: updatedPayment
      }
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// @desc    Get all promotions
// @route   GET /api/admin/promotions
// @access  Private (Admin)
router.get('/promotions', protectAdmin, checkPermission('canManagePromotions'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const promotions = await Promotion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    const total = await Promotion.countDocuments(query);

    res.json({
      success: true,
      data: {
        promotions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get promotions',
      error: error.message
    });
  }
});

// @desc    Create promotion
// @route   POST /api/admin/promotions
// @access  Private (Admin)
router.post('/promotions', protectAdmin, checkPermission('canManagePromotions'), validatePromotion, async (req, res) => {
  try {
    const promotionData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const promotion = await Promotion.create(promotionData);

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: {
        promotion
      }
    });
  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create promotion',
      error: error.message
    });
  }
});

// @desc    Update promotion
// @route   PUT /api/admin/promotions/:id
// @access  Private (Admin)
router.put('/promotions/:id', protectAdmin, checkPermission('canManagePromotions'), async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.admin._id
    };

    const updatedPromotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: {
        promotion: updatedPromotion
      }
    });
  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update promotion',
      error: error.message
    });
  }
});

// @desc    Delete promotion
// @route   DELETE /api/admin/promotions/:id
// @access  Private (Admin)
router.delete('/promotions/:id', protectAdmin, checkPermission('canManagePromotions'), async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    await Promotion.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete promotion',
      error: error.message
    });
  }
});

// @desc    Get all registered serial numbers
// @route   GET /api/admin/serials
// @access  Private (Admin)
router.get('/serials', protectAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { serialNumber: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { inverterModel: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    const serials = await SerialNumber.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('installer', 'name email loyaltyCardId phone');

    const total = await SerialNumber.countDocuments(query);

    // Get summary statistics
    const totalSerials = await SerialNumber.countDocuments();
    const uniqueInstallers = await SerialNumber.distinct('installer').then(arr => arr.length);
    const uniqueProducts = await SerialNumber.distinct('inverterModel').then(arr => arr.length);
    const uniqueCities = await SerialNumber.distinct('location.city').then(arr => arr.length);

    res.json({
      success: true,
      data: {
        serials,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalSerials,
          uniqueInstallers,
          uniqueProducts,
          uniqueCities
        }
      }
    });
  } catch (error) {
    console.error('Get admin serials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get serial numbers',
      error: error.message
    });
  }
});

// @desc    Get all valid serial numbers
// @route   GET /api/admin/valid-serials
// @access  Private (Admin)
router.get('/valid-serials', protectAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search;
    const status = req.query.status; // 'used' or 'available'
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.serialNumber = { $regex: search, $options: 'i' };
    }
    if (status === 'used') {
      query.isUsed = true;
    } else if (status === 'available') {
      query.isUsed = false;
    }

    const validSerials = await ValidSerial.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'name email')
      .populate('usedBy', 'name email loyaltyCardId');

    const total = await ValidSerial.countDocuments(query);
    const availableCount = await ValidSerial.getAvailableCount();
    const usedCount = await ValidSerial.getUsedCount();

    res.json({
      success: true,
      data: {
        serials: validSerials.map(serial => serial.getDisplayInfo()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          total: availableCount + usedCount,
          available: availableCount,
          used: usedCount
        }
      }
    });
  } catch (error) {
    console.error('Get valid serials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get valid serial numbers',
      error: error.message
    });
  }
});

// @desc    Add valid serial number
// @route   POST /api/admin/valid-serials
// @access  Private (Admin)
router.post('/valid-serials', protectAdmin, async (req, res) => {
  try {
    const { serialNumber, notes } = req.body;

    if (!serialNumber) {
      return res.status(400).json({
        success: false,
        message: 'Serial number is required'
      });
    }

    // Check if serial already exists in valid serials
    const existingValid = await ValidSerial.findOne({
      serialNumber: serialNumber.toUpperCase()
    });

    if (existingValid) {
      return res.status(400).json({
        success: false,
        message: 'Serial number already exists in valid serials list'
      });
    }

    // Check if serial is already registered by an installer
    const existingRegistered = await SerialNumber.findOne({
      serialNumber: serialNumber.toUpperCase()
    });

    if (existingRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Serial number is already registered by an installer'
      });
    }

    // Get product info if provided, otherwise try to auto-detect
    let productId = req.body.productId;

    if (!productId) {
      // Try to auto-detect product by serial number pattern
      const Product = require('../models/Product');
      const detectedProduct = await Product.findBySerialNumber(serialNumber);
      if (detectedProduct) {
        productId = detectedProduct._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Product not specified and could not be auto-detected. Please specify the product for this serial number.'
        });
      }
    }

    const validSerial = await ValidSerial.create({
      serialNumber: serialNumber.toUpperCase(),
      product: productId,
      addedBy: req.admin._id,
      notes: notes || ''
    });

    const populatedSerial = await ValidSerial.findById(validSerial._id)
      .populate('addedBy', 'name email')
      .populate('product', 'name model type points');

    res.status(201).json({
      success: true,
      message: 'Valid serial number added successfully',
      data: {
        serial: populatedSerial.getDisplayInfo()
      }
    });
  } catch (error) {
    console.error('Add valid serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add valid serial number',
      error: error.message
    });
  }
});

// @desc    Upload multiple valid serial numbers
// @route   POST /api/admin/valid-serials/upload
// @access  Private (Admin)
router.post('/valid-serials/upload', protectAdmin, async (req, res) => {
  try {
    const { csvData } = req.body;

    if (!csvData || !csvData.trim()) {
      return res.status(400).json({
        success: false,
        message: 'CSV data is required'
      });
    }

    // Parse CSV data (simple comma-separated or line-separated)
    const serialNumbers = csvData
      .split(/[,\n\r]+/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length >= 6 && s.length <= 20 && /^[A-Z0-9]+$/.test(s));

    if (serialNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid serial numbers found in CSV data'
      });
    }

    const results = {
      total: serialNumbers.length,
      added: 0,
      skipped: 0,
      errors: []
    };

    for (const serialNumber of serialNumbers) {
      try {
        // Check if already exists
        const existingValid = await ValidSerial.findOne({ serialNumber });
        const existingRegistered = await SerialNumber.findOne({ serialNumber });

        if (existingValid || existingRegistered) {
          results.skipped++;
          continue;
        }

        await ValidSerial.create({
          serialNumber,
          addedBy: req.admin._id,
          notes: 'Bulk upload'
        });

        results.added++;
      } catch (error) {
        results.errors.push(`${serialNumber}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Upload completed. Added ${results.added} serial numbers, skipped ${results.skipped}`,
      data: results
    });
  } catch (error) {
    console.error('Upload valid serials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload valid serial numbers',
      error: error.message
    });
  }
});

// @desc    Add comment to payment
// @route   POST /api/admin/payments/:id/comments
// @access  Private (Admin)
router.post('/payments/:id/comments', protectAdmin, checkPermission('canManagePayments'), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment message is required'
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Initialize comments array if it doesn't exist
    if (!payment.comments) {
      payment.comments = [];
    }

    // Add new comment
    const newComment = {
      id: new Date().getTime().toString(),
      userId: req.admin._id,
      userName: req.admin.name || 'Admin',
      userType: 'admin',
      message: message.trim(),
      createdAt: new Date()
    };

    payment.comments.push(newComment);
    await payment.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    console.error('Add payment comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// @desc    Add receipt to payment
// @route   POST /api/admin/payments/:id/receipts
// @access  Private (Admin)
router.post('/payments/:id/receipts', protectAdmin, checkPermission('canManagePayments'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // For now, just simulate receipt upload
    // In a real implementation, you would handle file upload here
    const receipt = {
      id: new Date().getTime().toString(),
      fileName: req.body.fileName || 'receipt.pdf',
      uploadedBy: req.admin._id,
      uploadedAt: new Date(),
      fileSize: req.body.fileSize || 0,
      fileType: req.body.fileType || 'application/pdf'
    };

    // Initialize receipts array if it doesn't exist
    if (!payment.receipts) {
      payment.receipts = [];
    }

    payment.receipts.push(receipt);
    await payment.save();

    res.json({
      success: true,
      message: 'Receipt uploaded successfully',
      data: receipt
    });
  } catch (error) {
    console.error('Add payment receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload receipt',
      error: error.message
    });
  }
});

// @desc    Delete receipt from payment
// @route   DELETE /api/admin/payments/:id/receipts
// @access  Private (Admin)
router.delete('/payments/:id/receipts', protectAdmin, checkPermission('canManagePayments'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Clear all receipts (in a real implementation, you might want to delete specific receipts)
    payment.receipts = [];
    await payment.save();

    res.json({
      success: true,
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete receipt',
      error: error.message
    });
  }
});

// @desc    Delete payment request
// @route   DELETE /api/admin/payments/:id
// @access  Private (Admin)
router.delete('/payments/:id', protectAdmin, checkPermission('canManagePayments'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Payment request deleted successfully'
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment request',
      error: error.message
    });
  }
});

// Mount admin sub-routes
router.use('/training', adminTrainingRoutes);
// router.use('/documents', adminDocumentsRoutes); // Temporarily disabled

module.exports = router;

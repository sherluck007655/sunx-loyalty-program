const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { protectInstaller } = require('../middleware/auth');

// @desc    Get installer's payment history
// @route   GET /api/payment/history
// @access  Private (Installer)
router.get('/history', protectInstaller, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // Build query
    const query = { installer: req.installer._id };
    if (status && ['pending', 'approved', 'paid', 'rejected'].includes(status)) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('promotionId', 'title description')
      .populate('approvedBy', 'name email');

    const total = await Payment.countDocuments(query);

    // Calculate summary statistics
    const summary = await Payment.aggregate([
      { $match: { installer: req.installer._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const summaryData = {
      totalEarned: 0,
      totalPending: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalPayments: total
    };

    summary.forEach(item => {
      switch (item._id) {
        case 'paid':
          summaryData.totalEarned = item.totalAmount;
          break;
        case 'pending':
          summaryData.totalPending = item.totalAmount;
          break;
        case 'approved':
          summaryData.totalApproved = item.totalAmount;
          break;
        case 'rejected':
          summaryData.totalRejected = item.totalAmount;
          break;
      }
    });

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
        },
        summary: summaryData
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
});

// @desc    Get payment details
// @route   GET /api/payment/:id
// @access  Private (Installer)
router.get('/:id', protectInstaller, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      installer: req.installer._id
    })
      .populate('promotionId', 'title description')
      .populate('approvedBy', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Transform payment to include id field for frontend compatibility
    const paymentObj = payment.toObject();
    paymentObj.id = paymentObj._id.toString();

    res.json({
      success: true,
      data: {
        payment: paymentObj
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
      error: error.message
    });
  }
});

// @desc    Request payment (Manual payment request by installer)
// @route   POST /api/payment/request
// @access  Private (Installer)
router.post('/request', protectInstaller, async (req, res) => {
  try {
    const {
      amount,
      description,
      paymentMethod,
      bankTitle,
      bankName,
      branchCode,
      ibanNumber,
      paymentType = 'manual' // Default to manual for user-initiated requests
    } = req.body;

    // Validate required fields
    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Payment description is required'
      });
    }

    // Validate installer eligibility
    if (!req.installer.isEligibleForPayment) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for payment yet. You need at least 1000 points to request payment.'
      });
    }

    // Check for existing pending payment request
    const existingPendingPayment = await Payment.findOne({
      installer: req.installer._id,
      status: 'pending'
    });

    if (existingPendingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending payment request. Please wait for it to be processed.'
      });
    }

    // Validate bank details if provided (for manual requests)
    let bankDetails = {};
    if (paymentMethod === 'bank_transfer') {
      if (!bankTitle || !bankName || !branchCode || !ibanNumber) {
        return res.status(400).json({
          success: false,
          message: 'Bank details are required for bank transfer payments'
        });
      }

      bankDetails = {
        accountTitle: bankTitle.trim(),
        accountNumber: ibanNumber.trim(),
        bankName: bankName.trim(),
        branchCode: branchCode.trim()
      };
    }

    // Calculate default amount if not provided
    const paymentAmount = amount && amount > 0 ? amount : 5000; // Default milestone amount

    // Create payment request
    const payment = await Payment.create({
      installer: req.installer._id,
      amount: paymentAmount,
      currency: 'PKR',
      paymentType: paymentType,
      description: description.trim(),
      paymentMethod: paymentMethod || 'bank_transfer',
      bankDetails: Object.keys(bankDetails).length > 0 ? bankDetails : req.installer.bankDetails,
      status: 'pending',
      milestoneReached: paymentType === 'milestone' ? req.installer.totalInverters : undefined,
      inverterCount: req.installer.totalInverters // Add the required inverterCount field
    });

    // Populate installer details for response
    await payment.populate('installer', 'name email loyaltyCardId');

    // Create notification for installer
    const Notification = require('../models/Notification');
    await Notification.create({
      recipientId: payment.installer._id,
      recipientType: 'installer',
      type: 'milestone_reached',
      title: 'Payment Request Submitted',
      message: `Your payment request for ${payment.currency} ${payment.amount} has been submitted and is pending admin review.`,
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment request submitted successfully',
      data: {
        payment: payment
      }
    });
  } catch (error) {
    console.error('Request payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit payment request',
      error: error.message
    });
  }
});

// @desc    Get payment statistics
// @route   GET /api/payment/stats
// @access  Private (Installer)
router.get('/stats/summary', protectInstaller, async (req, res) => {
  try {
    const installerId = req.installer._id;

    // Get monthly earnings for the last 12 months
    const monthlyEarnings = await Payment.aggregate([
      {
        $match: {
          installer: installerId,
          status: 'paid',
          paidAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get payment type breakdown
    const paymentTypeBreakdown = await Payment.aggregate([
      {
        $match: {
          installer: installerId,
          status: 'paid'
        }
      },
      {
        $group: {
          _id: '$paymentType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentActivity = await Payment.find({
      installer: installerId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount status description createdAt paymentType');

    res.json({
      success: true,
      data: {
        monthlyEarnings,
        paymentTypeBreakdown,
        recentActivity,
        installer: {
          totalInverters: req.installer.totalInverters,
          totalPoints: req.installer.totalPoints,
          isEligibleForPayment: req.installer.isEligibleForPayment
        }
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics',
      error: error.message
    });
  }
});

// @desc    Add comment to payment (Installer)
// @route   POST /api/payment/:id/comments
// @access  Private (Installer)
router.post('/:id/comments', protectInstaller, async (req, res) => {
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

    // Check if payment belongs to the installer
    if (payment.installer.toString() !== req.installer._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Initialize comments array if it doesn't exist
    if (!payment.comments) {
      payment.comments = [];
    }

    // Add new comment
    const newComment = {
      id: new Date().getTime().toString(),
      userId: req.installer._id,
      userName: req.installer.name || 'Installer',
      userType: 'installer',
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

module.exports = router;

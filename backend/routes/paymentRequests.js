const express = require('express');
const router = express.Router();
const PaymentRequest = require('../models/PaymentRequest');
const SerialNumber = require('../models/SerialNumber');
const Installer = require('../models/Installer');
const { protectInstaller } = require('../middleware/auth');

// @desc    Get installer's payment requests
// @route   GET /api/payment-requests
// @access  Private (Installer)
router.get('/', protectInstaller, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const paymentRequests = await PaymentRequest.find({ installer: req.installer._id })
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('serialNumbers.serialNumber', 'serialNumber installationDate');

    const total = await PaymentRequest.countDocuments({ installer: req.installer._id });

    // Calculate totals
    const totalPaid = await PaymentRequest.getInstallerTotalPaid(req.installer._id);
    const totalPending = await PaymentRequest.getInstallerPendingAmount(req.installer._id);

    res.json({
      success: true,
      data: {
        paymentRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        summary: {
          totalPaid: totalPaid.totalAmount,
          totalPending: totalPending.totalAmount,
          totalRequests: total
        }
      }
    });
  } catch (error) {
    console.error('Get payment requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment requests',
      error: error.message
    });
  }
});

// @desc    Create new payment request
// @route   POST /api/payment-requests
// @access  Private (Installer)
router.post('/', protectInstaller, async (req, res) => {
  try {
    const { pointsRequested, notes } = req.body;

    // Validate minimum points
    if (!pointsRequested || pointsRequested < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 1000 points required for payment request'
      });
    }

    // Get installer's current points
    const totalPoints = await SerialNumber.getInstallerTotalPoints(req.installer._id);
    
    // Get pending payment points
    const pendingStats = await PaymentRequest.getInstallerPendingAmount(req.installer._id);
    const availablePoints = totalPoints - pendingStats.totalPoints;

    if (availablePoints < pointsRequested) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. Available: ${availablePoints}, Requested: ${pointsRequested}`
      });
    }

    // Get installer's bank details
    const installer = await Installer.findById(req.installer._id);
    if (!installer.bankDetails || !installer.bankDetails.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your bank details in profile before requesting payment'
      });
    }

    // Get serial numbers that contribute to these points
    const serials = await SerialNumber.find({ installer: req.installer._id })
      .sort({ createdAt: 1 })
      .populate('product', 'points');

    let pointsCollected = 0;
    const serialsForPayment = [];

    for (const serial of serials) {
      if (pointsCollected >= pointsRequested) break;
      
      // Check if this serial is already in a pending/approved payment
      const existingRequest = await PaymentRequest.findOne({
        installer: req.installer._id,
        status: { $in: ['pending', 'approved'] },
        'serialNumbers.serialNumber': serial._id
      });

      if (!existingRequest) {
        serialsForPayment.push({
          serialNumber: serial._id,
          points: serial.pointsEarned
        });
        pointsCollected += serial.pointsEarned;
      }
    }

    // Create payment request
    const paymentRequest = new PaymentRequest({
      installer: req.installer._id,
      pointsRequested,
      pointValue: 50, // PKR 50 per point
      serialNumbers: serialsForPayment,
      availablePointsAtRequest: totalPoints,
      bankDetails: {
        accountTitle: installer.bankDetails.accountTitle,
        accountNumber: installer.bankDetails.accountNumber,
        bankName: installer.bankDetails.bankName,
        branchCode: installer.bankDetails.branchCode,
        iban: installer.bankDetails.iban
      },
      notes
    });

    await paymentRequest.save();

    // Populate for response
    const populatedRequest = await PaymentRequest.findById(paymentRequest._id)
      .populate('serialNumbers.serialNumber', 'serialNumber installationDate');

    res.status(201).json({
      success: true,
      message: 'Payment request created successfully',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Create payment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment request',
      error: error.message
    });
  }
});

// @desc    Get payment request by ID
// @route   GET /api/payment-requests/:id
// @access  Private (Installer)
router.get('/:id', protectInstaller, async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findOne({
      _id: req.params.id,
      installer: req.installer._id
    }).populate('serialNumbers.serialNumber', 'serialNumber installationDate product')
      .populate('approvedBy', 'name');

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }

    res.json({
      success: true,
      data: paymentRequest
    });
  } catch (error) {
    console.error('Get payment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment request',
      error: error.message
    });
  }
});

// @desc    Cancel payment request (only if pending)
// @route   DELETE /api/payment-requests/:id
// @access  Private (Installer)
router.delete('/:id', protectInstaller, async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findOne({
      _id: req.params.id,
      installer: req.installer._id,
      status: 'pending'
    });

    if (!paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found or cannot be cancelled'
      });
    }

    await PaymentRequest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Payment request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel payment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel payment request',
      error: error.message
    });
  }
});

// @desc    Get installer's available points for payment
// @route   GET /api/payment-requests/available-points
// @access  Private (Installer)
router.get('/available-points', protectInstaller, async (req, res) => {
  try {
    const totalPoints = await SerialNumber.getInstallerTotalPoints(req.installer._id);
    const pendingStats = await PaymentRequest.getInstallerPendingAmount(req.installer._id);
    const availablePoints = totalPoints - pendingStats.totalPoints;

    res.json({
      success: true,
      data: {
        totalPoints,
        pendingPoints: pendingStats.totalPoints,
        availablePoints,
        minimumRequired: 1000,
        canRequestPayment: availablePoints >= 1000,
        pointValue: 50,
        currency: 'PKR',
        estimatedAmount: availablePoints * 50
      }
    });
  } catch (error) {
    console.error('Get available points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available points',
      error: error.message
    });
  }
});

module.exports = router;

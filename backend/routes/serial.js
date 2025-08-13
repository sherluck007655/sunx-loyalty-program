const express = require('express');
const router = express.Router();
const SerialNumber = require('../models/SerialNumber');
const ValidSerial = require('../models/ValidSerial');
const Installer = require('../models/Installer');
const Payment = require('../models/Payment');
const { protectInstaller } = require('../middleware/auth');
const { validateSerialNumber } = require('../middleware/validation');

// @desc    Get installer's serial numbers
// @route   GET /api/serial
// @access  Private (Installer)
router.get('/', protectInstaller, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    let query = { installer: req.installer._id };

    if (search) {
      query.$or = [
        { serialNumber: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { inverterModel: { $regex: search, $options: 'i' } }
      ];
    }

    const serials = await SerialNumber.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SerialNumber.countDocuments(query);

    res.json({
      success: true,
      data: {
        serials: serials.map(serial => serial.getDisplayInfo()),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
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

// @desc    Add serial number
// @route   POST /api/serial/add
// @access  Private (Installer)
router.post('/add', protectInstaller, validateSerialNumber, async (req, res) => {
  try {
    console.log('Add serial request body:', req.body); // Debug log
    const {
      serialNumber,
      installationDate,
      location,
      customerName,
      customerPhone,
      notes,
      // Legacy fields for backward compatibility
      inverterModel,
      capacity
    } = req.body;

    // Check if serial number already exists
    const existingSerial = await SerialNumber.isSerialExists(serialNumber);

    if (existingSerial) {
      return res.status(400).json({
        success: false,
        message: 'Serial number already registered'
      });
    }

    // Get serial info with product details
    const validSerialInfo = await ValidSerial.getSerialInfo(serialNumber);
    if (!validSerialInfo) {
      return res.status(400).json({
        success: false,
        message: 'Serial number is not in the approved list or already used'
      });
    }

    // Create new serial number entry with product info
    const newSerial = await SerialNumber.create({
      serialNumber: serialNumber.toUpperCase(),
      installer: req.installer._id,
      product: validSerialInfo.product._id,
      pointsEarned: validSerialInfo.product.points,
      installationDate,
      location,
      customerName,
      customerPhone,
      notes,
      // Legacy fields for backward compatibility
      inverterModel,
      capacity
    });

    // Mark the valid serial as used and get updated info
    const usedSerial = await ValidSerial.markAsUsed(serialNumber, req.installer._id);

    // Update installer's progress (calculate actual count and points from database)
    const installer = await Installer.findById(req.installer._id);
    installer.totalInverters = await SerialNumber.countDocuments({ installer: req.installer._id });

    // Calculate total points from all registered serials
    const totalPoints = await SerialNumber.getInstallerTotalPoints(req.installer._id);
    installer.totalPoints = totalPoints;

    await installer.updateProgress();

    // Check if installer reached milestone (10 inverters)
    if (installer.totalInverters === 10) {
      // Create milestone payment
      await Payment.create({
        installer: installer._id,
        amount: 5000, // Example milestone bonus
        currency: 'PKR',
        paymentType: 'milestone',
        description: `Milestone bonus for completing 10 inverter installations`,
        milestoneReached: 10,
        status: 'pending'
      });

      // Send mock email notification
      console.log(`EMAIL: Congratulations ${installer.name}! You've reached 10 inverters and are eligible for payment.`);
    }

    // Check for active promotions and update progress
    const Promotion = require('../models/Promotion');
    const activePromotions = await Promotion.getInstallerPromotions(installer._id);
    
    for (const promotion of activePromotions) {
      await promotion.updateParticipantProgress(installer._id, installer.totalInverters);
      
      // Check if promotion target is reached
      const participant = promotion.participants.find(
        p => p.installer.toString() === installer._id.toString()
      );
      
      if (participant && participant.isCompleted && installer.totalInverters === promotion.targetInverters) {
        // Create promotion payment
        await Payment.create({
          installer: installer._id,
          amount: promotion.bonusAmount,
          currency: promotion.currency,
          paymentType: 'promotion',
          description: `Promotion bonus: ${promotion.title}`,
          promotionId: promotion._id,
          status: 'pending'
        });

        console.log(`EMAIL: Congratulations! You've completed the promotion "${promotion.title}" and earned ${promotion.bonusAmount} ${promotion.currency}!`);
      }
    }

    // Populate the new serial with product info for response
    const populatedSerial = await SerialNumber.findById(newSerial._id)
      .populate('product', 'name model type points');

    res.status(201).json({
      success: true,
      message: 'Serial number added successfully',
      data: {
        serial: {
          ...newSerial.getDisplayInfo(),
          product: validSerialInfo.product
        },
        installer: {
          totalInverters: installer.totalInverters,
          totalPoints: installer.totalPoints,
          isEligibleForPayment: installer.totalPoints >= 1000, // Updated to use points
          progressPercentage: Math.min((installer.totalPoints / 1000) * 100, 100) // Progress based on points
        }
      }
    });
  } catch (error) {
    console.error('Add serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add serial number',
      error: error.message
    });
  }
});

// @desc    Get serial number details
// @route   GET /api/serial/:id
// @access  Private (Installer)
router.get('/:id', protectInstaller, async (req, res) => {
  try {
    const serial = await SerialNumber.findOne({
      _id: req.params.id,
      installer: req.installer._id
    });

    if (!serial) {
      return res.status(404).json({
        success: false,
        message: 'Serial number not found'
      });
    }

    res.json({
      success: true,
      data: {
        serial: serial.getDisplayInfo()
      }
    });
  } catch (error) {
    console.error('Get serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get serial number',
      error: error.message
    });
  }
});

// @desc    Update serial number
// @route   PUT /api/serial/:id
// @access  Private (Installer)
router.put('/:id', protectInstaller, async (req, res) => {
  try {
    const { location, inverterModel, capacity, notes, status } = req.body;

    const serial = await SerialNumber.findOne({
      _id: req.params.id,
      installer: req.installer._id
    });

    if (!serial) {
      return res.status(404).json({
        success: false,
        message: 'Serial number not found'
      });
    }

    // Update allowed fields
    if (location) serial.location = location;
    if (inverterModel) serial.inverterModel = inverterModel;
    if (capacity) serial.capacity = capacity;
    if (notes) serial.notes = notes;
    if (status && ['active', 'inactive', 'maintenance'].includes(status)) {
      serial.status = status;
    }

    await serial.save();

    res.json({
      success: true,
      message: 'Serial number updated successfully',
      data: {
        serial: serial.getDisplayInfo()
      }
    });
  } catch (error) {
    console.error('Update serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update serial number',
      error: error.message
    });
  }
});

// @desc    Delete serial number
// @route   DELETE /api/serial/:id
// @access  Private (Installer)
router.delete('/:id', protectInstaller, async (req, res) => {
  try {
    const serial = await SerialNumber.findOne({
      _id: req.params.id,
      installer: req.installer._id
    });

    if (!serial) {
      return res.status(404).json({
        success: false,
        message: 'Serial number not found'
      });
    }

    // Check if serial was created within last 24 hours (allow deletion)
    const hoursSinceCreation = (new Date() - serial.createdAt) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 24) {
      return res.status(400).json({
        success: false,
        message: 'Serial number can only be deleted within 24 hours of creation'
      });
    }

    await SerialNumber.findByIdAndDelete(req.params.id);

    // Update installer's progress
    const installer = await Installer.findById(req.installer._id);
    installer.totalInverters = Math.max(0, installer.totalInverters - 1);
    await installer.updateProgress();

    res.json({
      success: true,
      message: 'Serial number deleted successfully',
      data: {
        installer: {
          totalInverters: installer.totalInverters,
          totalPoints: installer.totalPoints,
          isEligibleForPayment: installer.isEligibleForPayment
        }
      }
    });
  } catch (error) {
    console.error('Delete serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete serial number',
      error: error.message
    });
  }
});

// @desc    Check if serial number exists
// @route   GET /api/serial/check/:serialNumber
// @access  Private (Installer)
router.get('/check/:serialNumber', protectInstaller, async (req, res) => {
  try {
    const { serialNumber } = req.params;
    const exists = await SerialNumber.isSerialExists(serialNumber);

    res.json({
      success: true,
      data: {
        exists,
        serialNumber: serialNumber.toUpperCase()
      }
    });
  } catch (error) {
    console.error('Check serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check serial number',
      error: error.message
    });
  }
});

// @desc    Validate serial number format and availability
// @route   GET /api/serial/validate/:serialNumber
// @access  Private (Installer)
router.get('/validate/:serialNumber', protectInstaller, async (req, res) => {
  try {
    const { serialNumber } = req.params;

    // Check if serial number format is valid
    const serialRegex = /^[A-Z0-9]{6,20}$/;
    if (!serialRegex.test(serialNumber.toUpperCase())) {
      return res.json({
        success: true,
        data: {
          isValid: false,
          message: 'Serial number must be 6-20 alphanumeric characters',
          serialNumber: serialNumber.toUpperCase()
        }
      });
    }

    // Check if serial number already exists (already registered)
    const exists = await SerialNumber.isSerialExists(serialNumber);
    if (exists) {
      return res.json({
        success: true,
        data: {
          isValid: false,
          message: 'Serial number already registered',
          serialNumber: serialNumber.toUpperCase()
        }
      });
    }

    // Check if serial number is in the valid/approved list and get product info
    const validSerialInfo = await ValidSerial.getSerialInfo(serialNumber);
    if (!validSerialInfo) {
      return res.json({
        success: true,
        data: {
          isValid: false,
          message: 'Serial number is not in the approved list or already used',
          serialNumber: serialNumber.toUpperCase()
        }
      });
    }

    // Serial number is valid, approved, and available - include product info
    res.json({
      success: true,
      data: {
        isValid: true,
        message: 'Serial number is valid and available',
        serialNumber: serialNumber.toUpperCase(),
        product: {
          id: validSerialInfo.product._id,
          name: validSerialInfo.product.name,
          model: validSerialInfo.product.model,
          type: validSerialInfo.product.type,
          points: validSerialInfo.product.points,
          specifications: validSerialInfo.product.specifications
        }
      }
    });
  } catch (error) {
    console.error('Validate serial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate serial number',
      error: error.message
    });
  }
});

module.exports = router;

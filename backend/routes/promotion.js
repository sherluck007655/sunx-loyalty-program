const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');
const { protectInstaller } = require('../middleware/auth');

// @desc    Get active promotions for installer
// @route   GET /api/promotion/active
// @access  Private (Installer)
router.get('/active', protectInstaller, async (req, res) => {
  try {
    const promotions = await Promotion.getInstallerPromotions(req.installer._id);

    // Add participant progress for each promotion
    const promotionsWithProgress = promotions.map(promotion => {
      const participant = promotion.participants.find(
        p => p.installer.toString() === req.installer._id.toString()
      );

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
        bannerImage: promotion.bannerImage,
        priority: promotion.priority,
        daysRemaining: promotion.daysRemaining,
        isParticipating: !!participant,
        currentProgress: participant ? participant.currentProgress : 0,
        isCompleted: participant ? participant.isCompleted : false,
        progressPercentage: participant 
          ? Math.min((participant.currentProgress / promotion.targetInverters) * 100, 100)
          : 0
      };
    });

    res.json({
      success: true,
      data: {
        promotions: promotionsWithProgress,
        installerProgress: {
          totalInverters: req.installer.totalInverters,
          totalPoints: req.installer.totalPoints
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

// @desc    Join a promotion
// @route   POST /api/promotion/:id/join
// @access  Private (Installer)
router.post('/:id/join', protectInstaller, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if promotion is active
    if (!promotion.isCurrentlyActive) {
      return res.status(400).json({
        success: false,
        message: 'Promotion is not currently active'
      });
    }

    // Check if installer is already participating
    const existingParticipant = promotion.participants.find(
      p => p.installer.toString() === req.installer._id.toString()
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already participating in this promotion'
      });
    }

    // Check eligibility criteria
    if (promotion.eligibilityCriteria.minExistingInverters > req.installer.totalInverters) {
      return res.status(400).json({
        success: false,
        message: `You need at least ${promotion.eligibilityCriteria.minExistingInverters} inverters to join this promotion`
      });
    }

    // Check max participants limit
    if (promotion.eligibilityCriteria.maxParticipants && 
        promotion.participants.length >= promotion.eligibilityCriteria.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'This promotion has reached its maximum number of participants'
      });
    }

    // Add installer to promotion
    await promotion.addParticipant(req.installer._id);

    // Update progress with current inverter count
    await promotion.updateParticipantProgress(req.installer._id, req.installer.totalInverters);

    res.json({
      success: true,
      message: 'Successfully joined the promotion',
      data: {
        promotion: {
          id: promotion._id,
          title: promotion.title,
          targetInverters: promotion.targetInverters,
          bonusAmount: promotion.bonusAmount,
          currentProgress: req.installer.totalInverters
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

// @desc    Get promotion details
// @route   GET /api/promotion/:id
// @access  Private (Installer)
router.get('/:id', protectInstaller, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Check if installer is participating
    const participant = promotion.participants.find(
      p => p.installer.toString() === req.installer._id.toString()
    );

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
      daysRemaining: promotion.daysRemaining,
      totalParticipants: promotion.participants.length,
      isParticipating: !!participant,
      currentProgress: participant ? participant.currentProgress : 0,
      isCompleted: participant ? participant.isCompleted : false,
      joinedAt: participant ? participant.joinedAt : null,
      completedAt: participant ? participant.completedAt : null,
      progressPercentage: participant 
        ? Math.min((participant.currentProgress / promotion.targetInverters) * 100, 100)
        : 0,
      eligibilityCriteria: promotion.eligibilityCriteria
    };

    res.json({
      success: true,
      data: {
        promotion: promotionData
      }
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

// @desc    Get installer's promotion history
// @route   GET /api/promotion/history
// @access  Private (Installer)
router.get('/history/all', protectInstaller, async (req, res) => {
  try {
    const promotions = await Promotion.find({
      'participants.installer': req.installer._id
    }).sort({ createdAt: -1 });

    const promotionHistory = promotions.map(promotion => {
      const participant = promotion.participants.find(
        p => p.installer.toString() === req.installer._id.toString()
      );

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
        isCurrentlyActive: promotion.isCurrentlyActive,
        joinedAt: participant.joinedAt,
        currentProgress: participant.currentProgress,
        isCompleted: participant.isCompleted,
        completedAt: participant.completedAt,
        progressPercentage: Math.min((participant.currentProgress / promotion.targetInverters) * 100, 100)
      };
    });

    // Calculate statistics
    const stats = {
      totalJoined: promotionHistory.length,
      totalCompleted: promotionHistory.filter(p => p.isCompleted).length,
      totalActive: promotionHistory.filter(p => p.isCurrentlyActive && !p.isCompleted).length,
      totalEarned: promotionHistory
        .filter(p => p.isCompleted)
        .reduce((sum, p) => sum + p.bonusAmount, 0)
    };

    res.json({
      success: true,
      data: {
        promotions: promotionHistory,
        stats
      }
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

module.exports = router;

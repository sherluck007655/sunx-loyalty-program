const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const Admin = require('../models/Admin');

const createSamplePromotions = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');

    // Connect to MongoDB using the same configuration as the main app
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/sunx_loyalty', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('✅ Already connected to MongoDB');
    }
    
    // Check if promotions already exist
    const existingPromotions = await Promotion.countDocuments();
    console.log(`📊 Found ${existingPromotions} existing promotions`);
    
    if (existingPromotions > 0) {
      console.log('✅ Promotions already exist, skipping creation');
      return;
    }

    // Find or create an admin user for the promotions
    let admin = await Admin.findOne();
    if (!admin) {
      console.log('⚠️ No admin found, creating sample admin...');
      admin = await Admin.create({
        name: 'System Admin',
        email: 'admin@sunx.com',
        password: 'admin123', // This will be hashed by the model
        role: 'super_admin',
        permissions: {
          canManageInstallers: true,
          canManagePromotions: true,
          canManagePayments: true,
          canViewReports: true,
          canManageAdmins: true
        }
      });
      console.log('✅ Sample admin created');
    }

    console.log('🎯 Creating sample promotions...');

    const now = new Date();
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const samplePromotions = [
      {
        title: 'New Year Installation Boost',
        description: 'Start the year strong! Install 10 inverters and earn a bonus of PKR 15,000. Perfect for expanding your business in the new year.',
        type: 'seasonal',
        targetInverters: 10,
        bonusAmount: 15000,
        currency: 'PKR',
        startDate: now,
        endDate: oneMonthFromNow,
        isActive: true,
        isVisible: true,
        eligibilityCriteria: {
          minExistingInverters: 0,
          maxParticipants: 100,
          allowedRegions: [],
          excludedInstallers: []
        },
        priority: 8,
        createdBy: admin._id
      },
      {
        title: 'Monthly Target Challenge',
        description: 'Achieve your monthly goal! Install 25 inverters this month and receive PKR 35,000 bonus plus recognition as Installer of the Month.',
        type: 'monthly_target',
        targetInverters: 25,
        bonusAmount: 35000,
        currency: 'PKR',
        startDate: now,
        endDate: oneMonthFromNow,
        isActive: true,
        isVisible: true,
        eligibilityCriteria: {
          minExistingInverters: 5,
          maxParticipants: 50,
          allowedRegions: [],
          excludedInstallers: []
        },
        priority: 9,
        createdBy: admin._id
      },
      {
        title: 'Milestone Achievement Bonus',
        description: 'Reach the 50 inverter milestone and unlock a special bonus of PKR 75,000! This is a long-term goal for dedicated installers.',
        type: 'milestone_bonus',
        targetInverters: 50,
        bonusAmount: 75000,
        currency: 'PKR',
        startDate: now,
        endDate: threeMonthsFromNow,
        isActive: true,
        isVisible: true,
        eligibilityCriteria: {
          minExistingInverters: 10,
          maxParticipants: 25,
          allowedRegions: [],
          excludedInstallers: []
        },
        priority: 10,
        createdBy: admin._id
      },
      {
        title: 'Quick Start Promotion',
        description: 'New to our platform? Install your first 5 inverters and get PKR 8,000 bonus to kickstart your journey with us!',
        type: 'special_event',
        targetInverters: 5,
        bonusAmount: 8000,
        currency: 'PKR',
        startDate: now,
        endDate: twoMonthsFromNow,
        isActive: true,
        isVisible: true,
        eligibilityCriteria: {
          minExistingInverters: 0,
          maxParticipants: 200,
          allowedRegions: [],
          excludedInstallers: []
        },
        priority: 7,
        createdBy: admin._id
      }
    ];

    // Create promotions
    for (const promotionData of samplePromotions) {
      const promotion = await Promotion.create(promotionData);
      console.log(`✅ Created promotion: ${promotion.title}`);
    }

    console.log('🎉 Sample promotions created successfully!');
    console.log(`📊 Total promotions in database: ${await Promotion.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error creating sample promotions:', error);
    throw error;
  }
};

// Run the script if called directly
if (require.main === module) {
  createSamplePromotions()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createSamplePromotions;

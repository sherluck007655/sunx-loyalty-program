const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const Installer = require('../models/Installer');
const Promotion = require('../models/Promotion');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedAdmins = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ role: 'super_admin' });
    
    if (!existingAdmin) {
      const admin = await Admin.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@sunx.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'super_admin',
        permissions: {
          canManageInstallers: true,
          canManagePayments: true,
          canManagePromotions: true,
          canViewReports: true,
          canManageAdmins: true
        }
      });
      console.log('Super admin created:', admin.email);
    } else {
      console.log('Super admin already exists');
    }

    // Create additional admin
    const existingModerator = await Admin.findOne({ email: 'moderator@sunx.com' });
    if (!existingModerator) {
      const moderator = await Admin.create({
        name: 'Moderator',
        email: 'moderator@sunx.com',
        password: 'moderator123',
        role: 'moderator',
        permissions: {
          canManageInstallers: true,
          canManagePayments: true,
          canManagePromotions: false,
          canViewReports: true,
          canManageAdmins: false
        }
      });
      console.log('Moderator created:', moderator.email);
    }
  } catch (error) {
    console.error('Error seeding admins:', error);
  }
};

const seedPromotions = async () => {
  try {
    const admin = await Admin.findOne({ role: 'super_admin' });
    
    if (!admin) {
      console.log('No admin found to create promotions');
      return;
    }

    // Check if promotions already exist
    const existingPromotions = await Promotion.countDocuments();
    
    if (existingPromotions === 0) {
      const promotions = [
        {
          title: 'New Year Bonus 2025',
          description: 'Install 20 inverters this month and get an extra 10,000 PKR bonus!',
          type: 'monthly_target',
          targetInverters: 20,
          bonusAmount: 10000,
          currency: 'PKR',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
          isActive: true,
          isVisible: true,
          priority: 9,
          createdBy: admin._id,
          eligibilityCriteria: {
            minExistingInverters: 5,
            maxParticipants: 100
          }
        },
        {
          title: 'Summer Installation Drive',
          description: 'Beat the heat! Install 15 inverters during summer months for a special bonus.',
          type: 'seasonal',
          targetInverters: 15,
          bonusAmount: 7500,
          currency: 'PKR',
          startDate: new Date('2025-04-01'),
          endDate: new Date('2025-06-30'),
          isActive: true,
          isVisible: true,
          priority: 7,
          createdBy: admin._id,
          eligibilityCriteria: {
            minExistingInverters: 0,
            maxParticipants: 200
          }
        },
        {
          title: 'Quick Start Bonus',
          description: 'New installers: Install your first 5 inverters and get a welcome bonus!',
          type: 'milestone_bonus',
          targetInverters: 5,
          bonusAmount: 2500,
          currency: 'PKR',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          isActive: true,
          isVisible: true,
          priority: 8,
          createdBy: admin._id,
          eligibilityCriteria: {
            minExistingInverters: 0,
            maxParticipants: null
          }
        }
      ];

      await Promotion.insertMany(promotions);
      console.log(`${promotions.length} promotions created`);
    } else {
      console.log('Promotions already exist');
    }
  } catch (error) {
    console.error('Error seeding promotions:', error);
  }
};

const seedSampleInstallers = async () => {
  try {
    const existingInstallers = await Installer.countDocuments();

    if (existingInstallers === 0) {
      const sampleInstallers = [
        {
          name: 'Ahmed Ali',
          email: 'ahmed.ali@example.com',
          phone: '+923001234567',
          password: 'password123',
          cnic: '12345-1234567-1',
          address: 'House 123, Block A, Gulberg, Lahore',
          totalInverters: 8,
          totalPoints: 80
        },
        {
          name: 'Fatima Khan',
          email: 'fatima.khan@example.com',
          phone: '+923009876543',
          password: 'password123',
          cnic: '54321-7654321-2',
          address: 'Flat 456, DHA Phase 2, Karachi',
          totalInverters: 12,
          totalPoints: 120,
          isEligibleForPayment: true
        },
        {
          name: 'Muhammad Hassan',
          email: 'hassan@example.com',
          phone: '+923005555555',
          password: 'password123',
          cnic: '11111-2222222-3',
          address: 'Street 789, F-7, Islamabad',
          totalInverters: 5,
          totalPoints: 50
        }
      ];

      // Create installers one by one to trigger password hashing middleware
      for (const installerData of sampleInstallers) {
        // Generate unique loyalty card ID for each installer
        installerData.loyaltyCardId = await Installer.generateLoyaltyCardId();
        await Installer.create(installerData);
      }
      console.log(`${sampleInstallers.length} sample installers created`);
    } else {
      console.log('Sample installers already exist');
    }
  } catch (error) {
    console.error('Error seeding sample installers:', error);
  }
};

const runSeed = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    await seedAdmins();
    await seedPromotions();
    await seedSampleInstallers();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = {
  seedAdmins,
  seedPromotions,
  seedSampleInstallers,
  runSeed
};

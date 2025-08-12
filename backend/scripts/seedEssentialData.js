const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for essential data seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedEssentialAdmins = async () => {
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
      console.log('✅ Super admin created:', admin.email);
    } else {
      console.log('✅ Super admin already exists - preserving existing data');
    }
  } catch (error) {
    console.error('Error seeding essential admins:', error);
  }
};

const runEssentialSeed = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Starting essential data seeding (preserving existing data)...');
    
    await seedEssentialAdmins();
    
    console.log('✅ Essential data seeding completed - all existing data preserved!');
    process.exit(0);
  } catch (error) {
    console.error('Essential seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  runEssentialSeed();
}

module.exports = {
  seedEssentialAdmins,
  runEssentialSeed
};

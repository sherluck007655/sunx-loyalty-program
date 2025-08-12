const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Admin = require('../models/Admin');
const Installer = require('../models/Installer');
const SerialNumber = require('../models/SerialNumber');
const Payment = require('../models/Payment');
const Promotion = require('../models/Promotion');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for data integrity check...');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const checkDataIntegrity = async () => {
  try {
    console.log('🔍 Checking data integrity...');
    console.log('=====================================');

    // Check Admins
    const adminCount = await Admin.countDocuments();
    const superAdmins = await Admin.countDocuments({ role: 'super_admin' });
    console.log(`👤 Admins: ${adminCount} total (${superAdmins} super admins)`);

    // Check Installers
    const installerCount = await Installer.countDocuments();
    const activeInstallers = await Installer.countDocuments({ isActive: true });
    console.log(`🔧 Installers: ${installerCount} total (${activeInstallers} active)`);

    // Check Serial Numbers
    const serialCount = await SerialNumber.countDocuments();
    const activeSerials = await SerialNumber.countDocuments({ status: 'active' });
    console.log(`📋 Serial Numbers: ${serialCount} total (${activeSerials} active)`);

    // Check Payments
    const paymentCount = await Payment.countDocuments();
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const approvedPayments = await Payment.countDocuments({ status: 'approved' });
    console.log(`💰 Payments: ${paymentCount} total (${pendingPayments} pending, ${approvedPayments} approved)`);

    // Check Promotions
    const promotionCount = await Promotion.countDocuments();
    const activePromotions = await Promotion.countDocuments({ isActive: true });
    console.log(`🎯 Promotions: ${promotionCount} total (${activePromotions} active)`);

    console.log('=====================================');

    // Data integrity warnings
    if (adminCount === 0) {
      console.log('⚠️  WARNING: No admin accounts found!');
    }

    if (installerCount === 0) {
      console.log('ℹ️  INFO: No installer accounts found (this is normal for a fresh system)');
    }

    if (serialCount === 0) {
      console.log('ℹ️  INFO: No serial numbers found (this is normal for a fresh system)');
    }

    if (paymentCount === 0) {
      console.log('ℹ️  INFO: No payments found (this is normal for a fresh system)');
    }

    // Check for sample/test data
    const testInstallers = await Installer.find({
      $or: [
        { email: { $regex: /example\.com$/i } },
        { name: { $regex: /test|demo|sample/i } }
      ]
    });

    if (testInstallers.length > 0) {
      console.log(`🧪 Found ${testInstallers.length} test/sample installer accounts:`);
      testInstallers.forEach(installer => {
        console.log(`   - ${installer.name} (${installer.email})`);
      });
    }

    console.log('=====================================');
    console.log('✅ Data integrity check completed!');
    
    return {
      admins: adminCount,
      installers: installerCount,
      serials: serialCount,
      payments: paymentCount,
      promotions: promotionCount,
      hasTestData: testInstallers.length > 0
    };

  } catch (error) {
    console.error('❌ Error checking data integrity:', error);
    throw error;
  }
};

const runCheck = async () => {
  try {
    await connectDB();
    const results = await checkDataIntegrity();
    
    console.log('\n📊 Summary:');
    console.log(`   Total Records: ${results.admins + results.installers + results.serials + results.payments + results.promotions}`);
    console.log(`   Production Ready: ${!results.hasTestData ? 'Yes' : 'No (contains test data)'}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Data integrity check failed:', error);
    process.exit(1);
  }
};

// Run check if this file is executed directly
if (require.main === module) {
  runCheck();
}

module.exports = {
  checkDataIntegrity,
  runCheck
};

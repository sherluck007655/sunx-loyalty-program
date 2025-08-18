const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import the Installer model
const Installer = require('./backend/models/Installer');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sunx_loyalty';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Extract all installers with their credentials
const extractInstallers = async () => {
  try {
    console.log('🔍 Extracting all installer credentials...');
    console.log('=' .repeat(80));

    // Get all installers with passwords (explicitly include password field)
    const installers = await Installer.find({}).select('+password');

    if (installers.length === 0) {
      console.log('❌ No installers found in the database');
      return;
    }

    console.log(`📊 Found ${installers.length} installer(s)\n`);

    // Format for SSH access
    console.log('🔐 INSTALLER CREDENTIALS FOR SSH ACCESS');
    console.log('=' .repeat(80));
    console.log('Server: root@45.93.138.5');
    console.log('SSH Command: ssh root@45.93.138.5');
    console.log('=' .repeat(80));

    // Display installer information
    installers.forEach((installer, index) => {
      console.log(`\n${index + 1}. INSTALLER: ${installer.name}`);
      console.log(`   Email: ${installer.email}`);
      console.log(`   Phone: ${installer.phone}`);
      console.log(`   CNIC: ${installer.cnic}`);
      console.log(`   Loyalty Card ID: ${installer.loyaltyCardId}`);
      console.log(`   Status: ${installer.status}`);
      console.log(`   Active: ${installer.isActive ? 'Yes' : 'No'}`);
      console.log(`   Verified: ${installer.isVerified ? 'Yes' : 'No'}`);
      console.log(`   Total Points: ${installer.totalPoints}`);
      console.log(`   Total Inverters: ${installer.totalInverters}`);
      console.log(`   Address: ${installer.address}`);
      console.log(`   Created: ${installer.createdAt}`);
      console.log(`   Last Login: ${installer.lastLogin || 'Never'}`);
      
      // Note about password (it's hashed, so we can't show the plain text)
      console.log(`   Password Hash: ${installer.password}`);
      console.log(`   ⚠️  Note: Password is hashed - use password reset if needed`);
      
      if (installer.bankDetails && installer.bankDetails.accountNumber) {
        console.log(`   Bank Details:`);
        console.log(`     Account Title: ${installer.bankDetails.accountTitle}`);
        console.log(`     Account Number: ${installer.bankDetails.accountNumber}`);
        console.log(`     Bank Name: ${installer.bankDetails.bankName}`);
        console.log(`     Branch Code: ${installer.bankDetails.branchCode}`);
      }
      
      console.log('   ' + '-'.repeat(60));
    });

    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS');
    console.log('=' .repeat(80));
    const activeCount = installers.filter(i => i.isActive).length;
    const verifiedCount = installers.filter(i => i.isVerified).length;
    const approvedCount = installers.filter(i => i.status === 'approved').length;
    const totalPoints = installers.reduce((sum, i) => sum + (i.totalPoints || 0), 0);
    const totalInverters = installers.reduce((sum, i) => sum + (i.totalInverters || 0), 0);

    console.log(`Total Installers: ${installers.length}`);
    console.log(`Active Installers: ${activeCount}`);
    console.log(`Verified Installers: ${verifiedCount}`);
    console.log(`Approved Installers: ${approvedCount}`);
    console.log(`Total Points Earned: ${totalPoints}`);
    console.log(`Total Inverters Installed: ${totalInverters}`);

    // SSH Access Information
    console.log('\n🔑 SSH ACCESS INFORMATION');
    console.log('=' .repeat(80));
    console.log('To access the server via SSH:');
    console.log('1. Command: ssh root@45.93.138.5');
    console.log('2. Enter the root password when prompted');
    console.log('3. Once connected, you can manage the loyalty program');
    console.log('\n📝 INSTALLER LOGIN CREDENTIALS');
    console.log('For installer app/web login, use:');
    installers.forEach((installer, index) => {
      console.log(`${index + 1}. Email/Phone: ${installer.email} or ${installer.phone}`);
      console.log(`   ⚠️  Password: [HASHED - Use password reset feature]`);
    });

    console.log('\n✅ Extraction completed successfully!');

  } catch (error) {
    console.error('❌ Error extracting installer data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await extractInstallers();
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { extractInstallers, connectDB };

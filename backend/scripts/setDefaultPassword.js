const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sunx-loyalty');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Installer Schema (simplified)
const installerSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  // ... other fields
});

const Installer = mongoose.model('Installer', installerSchema);

const setDefaultPassword = async () => {
  try {
    await connectDB();
    
    // Find the installer
    const installer = await Installer.findOne({ email: 'sunxpv@gmail.com' });
    
    if (!installer) {
      console.log('❌ Installer not found');
      return;
    }
    
    console.log('📋 Current installer data:');
    console.log('Email:', installer.email);
    console.log('Name:', installer.name);
    console.log('Has password:', !!installer.password);
    console.log('Password type:', typeof installer.password);
    console.log('Password value:', installer.password);
    console.log('Password length:', installer.password ? installer.password.length : 'N/A');

    // Always set a known password for testing
    const defaultPassword = 'admin123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    installer.password = hashedPassword;
    installer.passwordChangedAt = new Date();

    await installer.save();

    console.log('✅ Password reset successfully!');
    console.log('🔑 Current password: admin123');
    console.log('📝 You can now update this password through the UI');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

setDefaultPassword();

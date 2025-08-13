#!/usr/bin/env node

/**
 * Migrate Existing Serial Numbers to New Product System
 * This script updates existing serial numbers to include product references and points
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const SerialNumber = require('../models/SerialNumber');
const ValidSerial = require('../models/ValidSerial');
const Product = require('../models/Product');
const Installer = require('../models/Installer');

async function migrateExistingSerials() {
  try {
    console.log('🚀 Starting Serial Number Migration...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all existing serial numbers without product reference
    const existingSerials = await SerialNumber.find({
      $or: [
        { product: { $exists: false } },
        { product: null },
        { pointsEarned: { $exists: false } },
        { pointsEarned: null }
      ]
    });

    console.log(`📦 Found ${existingSerials.length} serial numbers to migrate`);

    if (existingSerials.length === 0) {
      console.log('✅ No serial numbers need migration');
      return;
    }

    // Get all products for matching
    const products = await Product.find({ isActive: true });
    console.log(`🔍 Found ${products.length} products for matching`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const serial of existingSerials) {
      try {
        console.log(`\n🔄 Processing serial: ${serial.serialNumber}`);

        // Try to find matching product by serial number pattern
        let matchedProduct = null;

        // First, try to find by serial pattern prefix
        for (const product of products) {
          if (product.serialPattern && product.serialPattern.prefix) {
            if (serial.serialNumber.toUpperCase().startsWith(product.serialPattern.prefix)) {
              matchedProduct = product;
              console.log(`   ✅ Matched by prefix: ${product.name} ${product.model}`);
              break;
            }
          }
        }

        // If no prefix match, try to match by legacy inverterModel field
        if (!matchedProduct && serial.inverterModel) {
          for (const product of products) {
            if (product.model.toLowerCase().includes(serial.inverterModel.toLowerCase()) ||
                serial.inverterModel.toLowerCase().includes(product.model.toLowerCase())) {
              matchedProduct = product;
              console.log(`   ✅ Matched by model: ${product.name} ${product.model}`);
              break;
            }
          }
        }

        // If still no match, try to find a default inverter product
        if (!matchedProduct) {
          matchedProduct = products.find(p => p.type === 'inverter');
          if (matchedProduct) {
            console.log(`   ⚠️  Using default inverter: ${matchedProduct.name} ${matchedProduct.model}`);
          }
        }

        if (!matchedProduct) {
          console.log(`   ❌ No matching product found, skipping...`);
          skippedCount++;
          continue;
        }

        // Update the serial number with product info
        serial.product = matchedProduct._id;
        serial.pointsEarned = matchedProduct.points;

        // Add customer info if missing
        if (!serial.customerName && serial.location && serial.location.address) {
          serial.customerName = 'Migrated Customer';
        }

        await serial.save();
        console.log(`   ✅ Updated with ${matchedProduct.points} points`);
        migratedCount++;

        // Also update corresponding ValidSerial if exists
        const validSerial = await ValidSerial.findOne({ 
          serialNumber: serial.serialNumber,
          isUsed: true 
        });

        if (validSerial && !validSerial.product) {
          validSerial.product = matchedProduct._id;
          validSerial.pointsAwarded = matchedProduct.points;
          await validSerial.save();
          console.log(`   ✅ Updated corresponding ValidSerial`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing ${serial.serialNumber}:`, error.message);
        errorCount++;
      }
    }

    // Update installer totals
    console.log('\n🔄 Updating installer totals...');
    const installers = await Installer.find();
    
    for (const installer of installers) {
      try {
        const totalPoints = await SerialNumber.getInstallerTotalPoints(installer._id);
        const totalProducts = await SerialNumber.countDocuments({ installer: installer._id });
        
        installer.totalPoints = totalPoints;
        installer.totalInverters = totalProducts;
        installer.isEligibleForPayment = totalPoints >= 1000;
        
        await installer.save();
        console.log(`   ✅ Updated installer ${installer.name}: ${totalPoints} points, ${totalProducts} products`);
      } catch (error) {
        console.error(`   ❌ Error updating installer ${installer.name}:`, error.message);
      }
    }

    // Display migration summary
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${migratedCount} serial numbers`);
    console.log(`⏭️  Skipped (no match): ${skippedCount} serial numbers`);
    console.log(`❌ Errors: ${errorCount} serial numbers`);

    // Display updated statistics
    const totalSerials = await SerialNumber.countDocuments();
    const serialsWithProducts = await SerialNumber.countDocuments({ 
      product: { $exists: true, $ne: null } 
    });
    const serialsWithPoints = await SerialNumber.countDocuments({ 
      pointsEarned: { $exists: true, $ne: null, $gt: 0 } 
    });

    console.log('\n📈 Current Statistics:');
    console.log(`📦 Total Serial Numbers: ${totalSerials}`);
    console.log(`🔗 With Product Reference: ${serialsWithProducts}`);
    console.log(`💰 With Points: ${serialsWithPoints}`);

    if (skippedCount > 0) {
      console.log('\n⚠️  Manual Review Required:');
      console.log(`${skippedCount} serial numbers could not be automatically matched.`);
      console.log('Please review these manually in the admin panel.');
    }

    console.log('\n🎉 Migration Complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Helper function to display unmatched serials
async function showUnmatchedSerials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const unmatchedSerials = await SerialNumber.find({
      $or: [
        { product: { $exists: false } },
        { product: null }
      ]
    }).limit(10);

    console.log('\n🔍 Sample Unmatched Serial Numbers:');
    unmatchedSerials.forEach(serial => {
      console.log(`   ${serial.serialNumber} - ${serial.inverterModel || 'No model'} - ${serial.location?.address || 'No address'}`);
    });

  } catch (error) {
    console.error('Error showing unmatched serials:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the migration
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'show-unmatched') {
    showUnmatchedSerials();
  } else {
    migrateExistingSerials();
  }
}

module.exports = { migrateExistingSerials, showUnmatchedSerials };

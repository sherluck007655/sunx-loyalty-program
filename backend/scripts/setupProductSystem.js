#!/usr/bin/env node

/**
 * Setup Product System Migration
 * This script sets up the new product management system with sample products
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Admin = require('../models/Admin');

// Sample products data
const sampleProducts = [
  // Inverters
  {
    name: 'SunX Pro Inverter',
    model: 'SX-3000',
    type: 'inverter',
    points: 300,
    specifications: {
      capacity: '3kW',
      voltage: '220V',
      efficiency: '95%',
      dimensions: '400x300x150mm',
      weight: '15kg'
    },
    serialPattern: {
      prefix: 'SX3',
      length: 12,
      format: 'ALPHANUMERIC'
    },
    description: 'High-efficiency 3kW solar inverter with advanced MPPT technology',
    manufacturer: 'SunX Solar',
    category: 'Residential Inverters'
  },
  {
    name: 'SunX Pro Inverter',
    model: 'SX-5000',
    type: 'inverter',
    points: 500,
    specifications: {
      capacity: '5kW',
      voltage: '220V',
      efficiency: '96%',
      dimensions: '500x350x180mm',
      weight: '22kg'
    },
    serialPattern: {
      prefix: 'SX5',
      length: 12,
      format: 'ALPHANUMERIC'
    },
    description: 'High-performance 5kW solar inverter for residential and small commercial use',
    manufacturer: 'SunX Solar',
    category: 'Residential Inverters'
  },
  {
    name: 'SunX Commercial Inverter',
    model: 'SXC-10000',
    type: 'inverter',
    points: 800,
    specifications: {
      capacity: '10kW',
      voltage: '380V',
      efficiency: '97%',
      dimensions: '600x400x200mm',
      weight: '35kg'
    },
    serialPattern: {
      prefix: 'SXC',
      length: 14,
      format: 'ALPHANUMERIC'
    },
    description: 'Commercial-grade 10kW three-phase solar inverter',
    manufacturer: 'SunX Solar',
    category: 'Commercial Inverters'
  },

  // Batteries
  {
    name: 'SunX Lithium Battery',
    model: 'SXB-100',
    type: 'battery',
    points: 200,
    specifications: {
      capacity: '100Ah',
      voltage: '12V',
      power: '1.2kWh',
      dimensions: '330x175x220mm',
      weight: '13kg'
    },
    serialPattern: {
      prefix: 'SXB',
      length: 10,
      format: 'ALPHANUMERIC'
    },
    description: 'High-capacity lithium iron phosphate battery for solar energy storage',
    manufacturer: 'SunX Solar',
    category: 'Energy Storage'
  },
  {
    name: 'SunX Lithium Battery',
    model: 'SXB-200',
    type: 'battery',
    points: 350,
    specifications: {
      capacity: '200Ah',
      voltage: '12V',
      power: '2.4kWh',
      dimensions: '520x240x220mm',
      weight: '24kg'
    },
    serialPattern: {
      prefix: 'SXB2',
      length: 10,
      format: 'ALPHANUMERIC'
    },
    description: 'High-capacity 200Ah lithium battery for extended energy storage',
    manufacturer: 'SunX Solar',
    category: 'Energy Storage'
  },

  // Solar Panels
  {
    name: 'SunX Monocrystalline Panel',
    model: 'SXP-300',
    type: 'solar_panel',
    points: 100,
    specifications: {
      power: '300W',
      voltage: '24V',
      efficiency: '20%',
      dimensions: '1650x992x35mm',
      weight: '18kg'
    },
    serialPattern: {
      prefix: 'SXP',
      length: 12,
      format: 'ALPHANUMERIC'
    },
    description: 'High-efficiency 300W monocrystalline solar panel',
    manufacturer: 'SunX Solar',
    category: 'Solar Panels'
  },
  {
    name: 'SunX Monocrystalline Panel',
    model: 'SXP-450',
    type: 'solar_panel',
    points: 150,
    specifications: {
      power: '450W',
      voltage: '24V',
      efficiency: '21%',
      dimensions: '2108x1048x35mm',
      weight: '23kg'
    },
    serialPattern: {
      prefix: 'SXP4',
      length: 12,
      format: 'ALPHANUMERIC'
    },
    description: 'Premium 450W monocrystalline solar panel with high efficiency',
    manufacturer: 'SunX Solar',
    category: 'Solar Panels'
  },

  // Charge Controllers
  {
    name: 'SunX MPPT Controller',
    model: 'SXCC-40',
    type: 'charge_controller',
    points: 80,
    specifications: {
      capacity: '40A',
      voltage: '12V/24V',
      efficiency: '98%',
      dimensions: '186x120x60mm',
      weight: '1.2kg'
    },
    serialPattern: {
      prefix: 'SXCC',
      length: 10,
      format: 'ALPHANUMERIC'
    },
    description: 'Advanced MPPT charge controller with LCD display',
    manufacturer: 'SunX Solar',
    category: 'Charge Controllers'
  },

  // Monitoring Systems
  {
    name: 'SunX Smart Monitor',
    model: 'SXM-WiFi',
    type: 'monitoring_system',
    points: 50,
    specifications: {
      connectivity: 'WiFi/Bluetooth',
      voltage: '12V/24V',
      dimensions: '120x80x25mm',
      weight: '0.3kg'
    },
    serialPattern: {
      prefix: 'SXM',
      length: 8,
      format: 'ALPHANUMERIC'
    },
    description: 'Smart monitoring system with mobile app connectivity',
    manufacturer: 'SunX Solar',
    category: 'Monitoring'
  },

  // Accessories
  {
    name: 'SunX DC Combiner Box',
    model: 'SXCB-4',
    type: 'accessories',
    points: 30,
    specifications: {
      capacity: '4 Strings',
      voltage: '1000V DC',
      dimensions: '300x200x120mm',
      weight: '2kg'
    },
    serialPattern: {
      prefix: 'SXCB',
      length: 8,
      format: 'ALPHANUMERIC'
    },
    description: '4-string DC combiner box with surge protection',
    manufacturer: 'SunX Solar',
    category: 'Electrical Components'
  }
];

async function setupProductSystem() {
  try {
    console.log('🚀 Starting Product System Setup...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the first admin user to assign as creator
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`👤 Using admin: ${admin.name} (${admin.email})`);

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    // Create sample products
    console.log('📦 Creating sample products...');
    
    for (const productData of sampleProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({
          name: productData.name,
          model: productData.model
        });

        if (existingProduct) {
          console.log(`⏭️  Product ${productData.name} ${productData.model} already exists, skipping...`);
          continue;
        }

        const product = new Product({
          ...productData,
          createdBy: admin._id
        });

        await product.save();
        console.log(`✅ Created: ${product.name} ${product.model} (${product.points} points)`);
      } catch (error) {
        console.error(`❌ Error creating product ${productData.name} ${productData.model}:`, error.message);
      }
    }

    // Display summary
    const totalProducts = await Product.countDocuments();
    const productsByType = await Product.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Product System Setup Summary:');
    console.log(`📦 Total Products: ${totalProducts}`);
    console.log('📋 Products by Type:');
    productsByType.forEach(type => {
      console.log(`   ${type._id}: ${type.count} products`);
    });

    console.log('\n🎉 Product System Setup Complete!');
    console.log('\n📝 Next Steps:');
    console.log('1. Use the admin panel to manage products and update points');
    console.log('2. Add valid serial numbers with product associations');
    console.log('3. Test the new serial registration system');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the setup
if (require.main === module) {
  setupProductSystem();
}

module.exports = setupProductSystem;

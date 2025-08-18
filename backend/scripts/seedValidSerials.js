/*
  Seed a small set of valid serial numbers per product for testing.
  - Reads products from DB
  - Generates a few valid serials for each product based on its serialPattern
  - Associates each valid serial with the product and the first admin (addedBy)

  Usage:
    node scripts/seedValidSerials.js            # default 5 serials per product
    SEED_PER_PRODUCT=3 node scripts/seedValidSerials.js
*/

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const ValidSerial = require('../models/ValidSerial');
const Admin = require('../models/Admin');

function randomAlphaNum(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function generateSerialForProduct(product) {
  const prefix = product.serialPattern?.prefix?.toUpperCase() || '';
  const length = product.serialPattern?.length || 12;
  const remaining = Math.max(0, length - prefix.length);
  return (prefix + randomAlphaNum(remaining)).toUpperCase();
}

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in backend/.env');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('✅ Connected to MongoDB');
}

async function seed() {
  const perProduct = parseInt(process.env.SEED_PER_PRODUCT || '5', 10);
  console.log(`🔧 Seeding ${perProduct} valid serial(s) per active product...`);

  const admin = await Admin.findOne();
  if (!admin) throw new Error('No admin user found; please create admin first.');

  const products = await Product.find({ isActive: true });
  console.log(`📦 Active products found: ${products.length}`);
  if (products.length === 0) {
    console.log('No products found. Run: node scripts/setupProductSystem.js');
    return;
  }

  let created = 0;
  for (const product of products) {
    for (let i = 0; i < perProduct; i++) {
      let attempts = 0;
      while (attempts < 5) {
        attempts++;
        const serialNumber = generateSerialForProduct(product);
        const exists = await ValidSerial.findOne({ serialNumber });
        if (exists) continue; // try a different one

        try {
          await ValidSerial.create({
            serialNumber,
            product: product._id,
            addedBy: admin._id,
            notes: 'Seeded serial for testing',
          });
          created++;
          console.log(`✅ Created: ${serialNumber} -> ${product.name} ${product.model}`);
          break;
        } catch (err) {
          if (err.code === 11000) continue; // unique index collision; retry
          console.error('❌ Error creating serial:', err.message);
          break;
        }
      }
    }
  }

  const total = await ValidSerial.countDocuments();
  console.log(`\n🎉 Seeding complete. Created ${created} serial(s). Total valid serials: ${total}`);
}

(async () => {
  try {
    await connect();
    await seed();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();


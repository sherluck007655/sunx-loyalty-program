const mongoose = require('mongoose');
require('dotenv').config();

const DocumentCategory = require('../models/DocumentCategory');
const Admin = require('../models/Admin');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sunx_loyalty';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

async function upsertCategory(Model, filter, data) {
  const existing = await Model.findOne(filter);
  if (existing) return existing;
  const created = await Model.create(data);
  return created;
}

async function run() {
  await connectDB();

  // Find an admin to use as createdBy
  let admin = await Admin.findOne();
  if (!admin) {
    // Create a default admin if none exists
    admin = await Admin.create({
      name: 'System Admin',
      email: 'admin@sunx.com',
      password: 'admin123', // This will be hashed by the model
      role: 'admin',
      isActive: true
    });
  }

  // Seed document categories
  const docCats = [
    { name: 'Inverter Documents', slug: 'inverter-documents', description: 'Manuals and specs for inverters', color: '#ff6b35', isActive: true, sortOrder: 1, createdBy: admin._id },
    { name: 'Battery Documents', slug: 'battery-documents', description: 'Battery manuals and specs', color: '#4ecdc4', isActive: true, sortOrder: 2, createdBy: admin._id },
    { name: 'Solar Panel Documents', slug: 'solar-panel-documents', description: 'Solar panel guides', color: '#45b7d1', isActive: true, sortOrder: 3, createdBy: admin._id },
    { name: 'Installation Guides', slug: 'installation-guides', description: 'Step-by-step installation guides', color: '#96ceb4', isActive: true, sortOrder: 4, createdBy: admin._id },
    { name: 'Troubleshooting', slug: 'troubleshooting', description: 'Common issues and solutions', color: '#feca57', isActive: true, sortOrder: 5, createdBy: admin._id },
    { name: 'Warranty Information', slug: 'warranty-information', description: 'Warranty terms and conditions', color: '#ff9ff3', isActive: true, sortOrder: 6, createdBy: admin._id }
  ];

  for (const c of docCats) {
    await upsertCategory(DocumentCategory, { slug: c.slug }, c);
  }

  console.log('Document categories seeded successfully.');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });


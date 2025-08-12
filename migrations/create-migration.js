#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function createMigration(name) {
    if (!name) {
        console.error('❌ Please provide a migration name');
        console.log('Usage: node create-migration.js <migration-name>');
        console.log('Example: node create-migration.js add-user-preferences');
        process.exit(1);
    }

    // Generate timestamp
    const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace(/\..+/, '')
        .replace('T', '');

    // Create filename
    const filename = `${timestamp}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.js`;
    const scriptsDir = path.join(__dirname, 'scripts');
    const filePath = path.join(scriptsDir, filename);

    // Ensure scripts directory exists
    if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // Migration template
    const template = `/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 * 
 * Description:
 * Add your migration description here
 */

async function up(db) {
    console.log('Running migration: ${name}');
    
    // Add your migration logic here
    // Examples:
    
    // Create a new collection
    // await db.createCollection('new_collection');
    
    // Add index
    // await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Update documents
    // await db.collection('users').updateMany(
    //     {},
    //     { $set: { newField: 'defaultValue' } }
    // );
    
    // Add new field to existing documents
    // await db.collection('loyalty_cards').updateMany(
    //     { tier: { $exists: false } },
    //     { $set: { tier: 'bronze' } }
    // );
    
    console.log('✅ Migration completed: ${name}');
}

async function down(db) {
    console.log('Rolling back migration: ${name}');
    
    // Add your rollback logic here
    // This should undo what the 'up' function did
    
    // Drop collection
    // await db.collection('new_collection').drop();
    
    // Remove index
    // await db.collection('users').dropIndex({ email: 1 });
    
    // Remove field
    // await db.collection('users').updateMany(
    //     {},
    //     { $unset: { newField: '' } }
    // );
    
    console.log('✅ Migration rolled back: ${name}');
}

module.exports = { up, down };
`;

    // Write the migration file
    fs.writeFileSync(filePath, template);
    
    console.log('✅ Migration created successfully!');
    console.log(`📁 File: ${filePath}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Edit the migration file to add your changes');
    console.log('2. Run: node migration-runner.js up');
    console.log('');
    console.log('Migration commands:');
    console.log('  node migration-runner.js status  # Check migration status');
    console.log('  node migration-runner.js up      # Run pending migrations');
    console.log(`  node migration-runner.js down ${filename}  # Rollback this migration`);
}

// Get migration name from command line
const migrationName = process.argv[2];
createMigration(migrationName);

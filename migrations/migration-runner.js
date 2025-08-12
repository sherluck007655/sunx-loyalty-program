const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

class MigrationRunner {
    constructor(mongoUri, dbName) {
        this.mongoUri = mongoUri;
        this.dbName = dbName;
        this.client = null;
        this.db = null;
        this.migrationsPath = path.join(__dirname, 'scripts');
    }

    async connect() {
        try {
            this.client = new MongoClient(this.mongoUri);
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            console.log('✅ Disconnected from MongoDB');
        }
    }

    async ensureMigrationsCollection() {
        const collections = await this.db.listCollections({ name: 'migrations' }).toArray();
        if (collections.length === 0) {
            await this.db.createCollection('migrations');
            console.log('✅ Created migrations collection');
        }
    }

    async getExecutedMigrations() {
        const migrations = await this.db.collection('migrations')
            .find({}, { projection: { filename: 1 } })
            .sort({ executedAt: 1 })
            .toArray();
        return migrations.map(m => m.filename);
    }

    async markMigrationAsExecuted(filename) {
        await this.db.collection('migrations').insertOne({
            filename,
            executedAt: new Date(),
            version: this.extractVersionFromFilename(filename)
        });
    }

    async markMigrationAsReverted(filename) {
        await this.db.collection('migrations').deleteOne({ filename });
    }

    extractVersionFromFilename(filename) {
        const match = filename.match(/^(\d{14})/);
        return match ? match[1] : null;
    }

    async getMigrationFiles() {
        if (!fs.existsSync(this.migrationsPath)) {
            console.log('📁 Creating migrations directory...');
            fs.mkdirSync(this.migrationsPath, { recursive: true });
            return [];
        }

        const files = fs.readdirSync(this.migrationsPath)
            .filter(file => file.endsWith('.js'))
            .sort();
        
        return files;
    }

    async loadMigration(filename) {
        const filePath = path.join(this.migrationsPath, filename);
        delete require.cache[require.resolve(filePath)];
        return require(filePath);
    }

    async runMigrations() {
        console.log('🚀 Starting migration process...');
        
        await this.ensureMigrationsCollection();
        
        const allMigrations = await this.getMigrationFiles();
        const executedMigrations = await this.getExecutedMigrations();
        
        const pendingMigrations = allMigrations.filter(
            migration => !executedMigrations.includes(migration)
        );

        if (pendingMigrations.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
        pendingMigrations.forEach(migration => console.log(`  - ${migration}`));

        for (const migrationFile of pendingMigrations) {
            try {
                console.log(`\n🔄 Running migration: ${migrationFile}`);
                
                const migration = await this.loadMigration(migrationFile);
                
                if (typeof migration.up !== 'function') {
                    throw new Error(`Migration ${migrationFile} must export an 'up' function`);
                }

                await migration.up(this.db);
                await this.markMigrationAsExecuted(migrationFile);
                
                console.log(`✅ Migration completed: ${migrationFile}`);
            } catch (error) {
                console.error(`❌ Migration failed: ${migrationFile}`);
                console.error(error);
                throw error;
            }
        }

        console.log('\n🎉 All migrations completed successfully!');
    }

    async rollbackMigration(filename) {
        console.log(`🔄 Rolling back migration: ${filename}`);
        
        const executedMigrations = await this.getExecutedMigrations();
        
        if (!executedMigrations.includes(filename)) {
            console.log(`⚠️  Migration ${filename} was not executed`);
            return;
        }

        try {
            const migration = await this.loadMigration(filename);
            
            if (typeof migration.down !== 'function') {
                throw new Error(`Migration ${filename} must export a 'down' function for rollback`);
            }

            await migration.down(this.db);
            await this.markMigrationAsReverted(filename);
            
            console.log(`✅ Migration rolled back: ${filename}`);
        } catch (error) {
            console.error(`❌ Rollback failed: ${filename}`);
            console.error(error);
            throw error;
        }
    }

    async getStatus() {
        await this.ensureMigrationsCollection();
        
        const allMigrations = await this.getMigrationFiles();
        const executedMigrations = await this.getExecutedMigrations();
        
        console.log('\n📊 Migration Status:');
        console.log('==================');
        
        if (allMigrations.length === 0) {
            console.log('No migration files found');
            return;
        }

        allMigrations.forEach(migration => {
            const status = executedMigrations.includes(migration) ? '✅ Executed' : '⏳ Pending';
            console.log(`${status} - ${migration}`);
        });
        
        const pendingCount = allMigrations.length - executedMigrations.length;
        console.log(`\nTotal: ${allMigrations.length} migrations, ${pendingCount} pending`);
    }
}

// CLI interface
async function main() {
    const command = process.argv[2];
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB || 'loyalty_program';
    
    const runner = new MigrationRunner(mongoUri, dbName);
    
    try {
        await runner.connect();
        
        switch (command) {
            case 'up':
                await runner.runMigrations();
                break;
            case 'down':
                const filename = process.argv[3];
                if (!filename) {
                    console.error('❌ Please specify migration filename for rollback');
                    process.exit(1);
                }
                await runner.rollbackMigration(filename);
                break;
            case 'status':
                await runner.getStatus();
                break;
            default:
                console.log('Usage:');
                console.log('  node migration-runner.js up              # Run pending migrations');
                console.log('  node migration-runner.js down <filename> # Rollback specific migration');
                console.log('  node migration-runner.js status          # Show migration status');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Migration process failed:', error);
        process.exit(1);
    } finally {
        await runner.disconnect();
    }
}

if (require.main === module) {
    main();
}

module.exports = MigrationRunner;

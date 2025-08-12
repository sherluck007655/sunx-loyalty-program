# 🚀 Deployment Guide: Upgrading Without Data Loss

This guide covers the complete process for safely upgrading your loyalty program application without losing database data.

## 📋 Table of Contents

1. [Development Workflow](#development-workflow)
2. [Database Backup & Restore](#database-backup--restore)
3. [Zero-Downtime Deployment](#zero-downtime-deployment)
4. [Database Migrations](#database-migrations)
5. [Rollback Strategy](#rollback-strategy)
6. [Production Deployment Steps](#production-deployment-steps)

## 🔄 Development Workflow

### 1. Making Changes

```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/new-reward-system

# Make your changes...
# Edit files, add features, fix bugs

# Test locally
npm test
docker-compose up --build

# Commit changes
git add .
git commit -m "feat: Add new reward tier system

- Added bronze, silver, gold tiers
- Implemented point multipliers
- Updated admin dashboard"

# Push feature branch
git push origin feature/new-reward-system
```

### 2. Code Review & Merge

```bash
# Create Pull Request on GitHub
# After review and approval, merge to develop

git checkout develop
git pull origin develop

# Deploy to staging
git push origin develop  # Triggers GitHub Actions
```

### 3. Production Release

```bash
# When ready for production
git checkout main
git merge develop
git push origin main  # Triggers production build
```

## 💾 Database Backup & Restore

### Automatic Backup Before Deployment

```bash
# Backup current database
./scripts/backup-database.sh

# Check backup status
ls -la /var/backups/loyalty-program/
```

### Manual Backup

```bash
# Create manual backup with custom name
BACKUP_NAME="pre_feature_backup" ./scripts/backup-database.sh
```

### Restore from Backup

```bash
# Restore from latest backup
./scripts/restore-database.sh

# Restore from specific backup
./scripts/restore-database.sh /var/backups/loyalty-program/loyalty_backup_20240812_143000.tar.gz
```

## 🔄 Zero-Downtime Deployment

### Safe Deployment Process

```bash
# Deploy latest version with backup
./scripts/safe-deploy.sh

# Deploy specific tag
./scripts/safe-deploy.sh -t v2.1.0

# Deploy without backup (not recommended for production)
./scripts/safe-deploy.sh -s -f
```

### Manual Blue-Green Deployment

```bash
# Pull new image
docker pull sherluck007655/sunx-loyalty-program:latest

# Start new container
docker run -d --name loyalty-program-new \
  --network loyalty-network \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb://loyalty-mongo:27017/loyalty_program \
  sherluck007655/sunx-loyalty-program:latest

# Health check
curl http://localhost:3000/health

# Switch traffic (update load balancer or port mapping)
# Stop old container after verification
```

## 🗃️ Database Migrations

### Creating Migrations

```bash
# Create new migration
node migrations/create-migration.js add-user-preferences

# This creates: migrations/scripts/20240812143000_add_user_preferences.js
```

### Running Migrations

```bash
# Check migration status
node migrations/migration-runner.js status

# Run pending migrations
node migrations/migration-runner.js up

# Rollback specific migration
node migrations/migration-runner.js down 20240812143000_add_user_preferences.js
```

### Example Migration

```javascript
// migrations/scripts/20240812143000_add_user_preferences.js
async function up(db) {
    // Add new field to users
    await db.collection('users').updateMany(
        { preferences: { $exists: false } },
        { $set: { preferences: { notifications: true, theme: 'light' } } }
    );
    
    // Create index
    await db.collection('users').createIndex({ 'preferences.theme': 1 });
}

async function down(db) {
    // Remove field
    await db.collection('users').updateMany(
        {},
        { $unset: { preferences: '' } }
    );
    
    // Drop index
    await db.collection('users').dropIndex({ 'preferences.theme': 1 });
}
```

## 🔙 Rollback Strategy

### Quick Rollback

```bash
# If deployment fails, containers are automatically rolled back
# Manual rollback to previous version
docker stop loyalty-program
docker rm loyalty-program
docker run -d --name loyalty-program \
  --network loyalty-network \
  -p 3000:3000 \
  sherluck007655/sunx-loyalty-program:previous-tag
```

### Database Rollback

```bash
# Restore from backup
./scripts/restore-database.sh

# Or rollback specific migration
node migrations/migration-runner.js down migration_filename.js
```

## 🚀 Production Deployment Steps

### Complete Deployment Checklist

1. **Pre-Deployment**
   ```bash
   # 1. Test locally
   npm test
   docker-compose up --build
   
   # 2. Create feature branch and PR
   git checkout -b feature/my-changes
   git push origin feature/my-changes
   
   # 3. Deploy to staging
   git checkout develop
   git merge feature/my-changes
   git push origin develop
   
   # 4. Test staging environment
   curl https://staging.yourdomain.com/health
   ```

2. **Database Changes**
   ```bash
   # 1. Create migration if needed
   node migrations/create-migration.js my-schema-changes
   
   # 2. Test migration on staging
   node migrations/migration-runner.js up
   
   # 3. Verify migration worked
   node migrations/migration-runner.js status
   ```

3. **Production Deployment**
   ```bash
   # 1. Merge to main
   git checkout main
   git merge develop
   git push origin main
   
   # 2. Wait for GitHub Actions to build
   # Check: https://github.com/sherluck007655/sunx-loyalty-program/actions
   
   # 3. Deploy to production
   ./scripts/safe-deploy.sh
   
   # 4. Run migrations if any
   node migrations/migration-runner.js up
   
   # 5. Verify deployment
   curl https://yourdomain.com/health
   ```

4. **Post-Deployment**
   ```bash
   # 1. Monitor logs
   docker logs loyalty-program -f
   
   # 2. Check database
   docker exec loyalty-mongo mongosh loyalty_program
   
   # 3. Test key functionality
   # - User registration
   # - Point earning
   # - Reward redemption
   # - Admin dashboard
   ```

## 🔧 Environment Variables

### Required Environment Variables

```bash
# Production
NODE_ENV=production
MONGO_URI=mongodb://loyalty-mongo:27017/loyalty_program
JWT_SECRET=your-super-secret-jwt-key
ADMIN_EMAIL=admin@yourdomain.com

# Optional
BACKUP_RETENTION_DAYS=7
HEALTH_CHECK_TIMEOUT=30
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Application health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/health/db

# Detailed status
curl http://localhost:3000/status
```

### Log Monitoring

```bash
# Application logs
docker logs loyalty-program -f

# Database logs
docker logs loyalty-mongo -f

# System logs
journalctl -u docker -f
```

## 🚨 Emergency Procedures

### If Deployment Fails

1. **Automatic Rollback**: The safe-deploy script automatically rolls back on failure
2. **Manual Rollback**: Use backup container or previous image
3. **Database Restore**: Restore from automatic backup created before deployment

### If Database is Corrupted

1. **Stop Application**: `docker stop loyalty-program`
2. **Restore Database**: `./scripts/restore-database.sh`
3. **Restart Application**: `docker start loyalty-program`

### Contact Information

- **Primary**: Your DevOps team
- **Secondary**: Database administrator
- **Emergency**: System administrator

---

## 📝 Quick Reference Commands

```bash
# Development
git checkout -b feature/name && git push origin feature/name

# Staging Deploy
git checkout develop && git merge feature/name && git push origin develop

# Production Deploy
git checkout main && git merge develop && git push origin main
./scripts/safe-deploy.sh

# Backup & Restore
./scripts/backup-database.sh
./scripts/restore-database.sh

# Migrations
node migrations/create-migration.js name
node migrations/migration-runner.js up
node migrations/migration-runner.js status

# Rollback
./scripts/safe-deploy.sh -t previous-version
node migrations/migration-runner.js down filename.js
```

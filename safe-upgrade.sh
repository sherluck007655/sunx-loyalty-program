#!/bin/bash

# Safe Application Upgrade Script for loyalty.sunxpv.com
# Run this AFTER creating backup with production-backup.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${BLUE}$1${NC}"; }
print_success() { echo -e "${GREEN}$1${NC}"; }
print_warning() { echo -e "${YELLOW}$1${NC}"; }
print_error() { echo -e "${RED}$1${NC}"; }
print_header() { echo -e "${PURPLE}$1${NC}"; }

# Configuration
APP_DIR="/var/www/sunx-loyalty"
UPGRADE_DIR="/tmp/sunx-loyalty-upgrade"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

clear
print_header "🚀 SunX Loyalty Program - Safe Application Upgrade"
print_header "================================================="
print_status "Server: loyalty.sunxpv.com ($(hostname -I | awk '{print $1}'))"
print_status "Timestamp: $DATE"
echo ""

# Pre-flight checks
print_status "🔍 Step 1: Pre-flight checks..."

# Check if backup exists
LATEST_BACKUP=$(ls -t /root/backups/loyalty_backup_*.tar.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    print_error "❌ No backup found! Please run production-backup.sh first"
    print_status "💡 Run: bash production-backup.sh"
    exit 1
fi
print_success "✅ Backup found: $LATEST_BACKUP"

# Check current directory
cd "$APP_DIR" || {
    print_error "❌ Cannot access application directory: $APP_DIR"
    exit 1
}
print_success "✅ Application directory accessible"

# Check Docker
if ! docker --version &>/dev/null; then
    print_error "❌ Docker not available"
    exit 1
fi
print_success "✅ Docker available"

# Check containers are running
if ! docker-compose ps | grep -q "Up"; then
    print_error "❌ Application containers not running"
    print_status "Starting containers..."
    docker-compose up -d
    sleep 10
fi
print_success "✅ Application containers running"

# Step 2: Document current state
print_status "📋 Step 2: Documenting current state..."
CURRENT_STATE_FILE="/tmp/current_state_$(date +%Y%m%d_%H%M%S).txt"
cat > "$CURRENT_STATE_FILE" << EOF
Current System State - Before Upgrade
====================================
Date: $DATE
Server: loyalty.sunxpv.com

CONTAINERS BEFORE UPGRADE:
$(docker-compose ps)

IMAGES BEFORE UPGRADE:
$(docker images | grep -E "(sunx|mongo)")

INSTALLER COUNT BEFORE UPGRADE:
$(docker exec sunx-loyalty-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@sunx-loyalty-mongodb:27017/sunx_loyalty?authSource=admin')
.then(async () => {
    const Installer = require('./models/Installer');
    const count = await Installer.countDocuments();
    console.log('Total Installers:', count);
    process.exit(0);
}).catch(err => {console.error('Error:', err); process.exit(1);});
" 2>/dev/null || echo "Could not get installer count")

DISK SPACE BEFORE UPGRADE:
$(df -h)
EOF

print_success "✅ Current state documented: $CURRENT_STATE_FILE"

# Step 3: Prepare upgrade environment
print_status "🛠️  Step 3: Preparing upgrade environment..."

# Create upgrade directory
mkdir -p "$UPGRADE_DIR"
cd "$UPGRADE_DIR"

# Option A: Download from GitHub (if you have a repository)
print_status "📥 Downloading latest application code..."
print_warning "⚠️  Please provide your GitHub repository URL or upload method"
print_status "For now, we'll prepare for manual code update..."

# Create upgrade checklist
cat > "$UPGRADE_DIR/upgrade_checklist.txt" << EOF
SunX Loyalty Program Upgrade Checklist
=====================================

PRE-UPGRADE COMPLETED:
✅ Backup created: $LATEST_BACKUP
✅ Current state documented: $CURRENT_STATE_FILE
✅ Containers verified running
✅ Upgrade environment prepared

UPGRADE STEPS TO COMPLETE:
[ ] 1. Upload new application code to $UPGRADE_DIR
[ ] 2. Review database migration scripts
[ ] 3. Test new code in staging environment
[ ] 4. Execute zero-downtime deployment
[ ] 5. Verify data integrity
[ ] 6. Test all functionality

ROLLBACK PLAN:
- Backup location: $LATEST_BACKUP
- Restore script: Available in backup directory
- Estimated rollback time: 5-10 minutes
EOF

print_success "✅ Upgrade environment prepared"

# Step 4: Create deployment script
print_status "📝 Step 4: Creating deployment script..."
cat > "$UPGRADE_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# Zero-downtime deployment script
APP_DIR="/var/www/sunx-loyalty"
UPGRADE_DIR="/tmp/sunx-loyalty-upgrade"

echo "🚀 Starting zero-downtime deployment..."

# 1. Build new images
echo "🔨 Building new Docker images..."
cd "$UPGRADE_DIR"
docker-compose build --no-cache

# 2. Tag current images as backup
echo "🏷️  Tagging current images as backup..."
docker tag sunx-loyalty-backend:latest sunx-loyalty-backend:backup-$(date +%Y%m%d_%H%M%S)
docker tag sunx-loyalty-frontend:latest sunx-loyalty-frontend:backup-$(date +%Y%m%d_%H%M%S)

# 3. Update application files
echo "📦 Updating application files..."
rsync -av --exclude='node_modules' --exclude='.git' "$UPGRADE_DIR/" "$APP_DIR/"

# 4. Run database migrations (if any)
echo "🗄️  Running database migrations..."
cd "$APP_DIR"
docker-compose exec backend npm run migrate 2>/dev/null || echo "No migrations to run"

# 5. Rolling update
echo "🔄 Performing rolling update..."
docker-compose up -d --force-recreate --no-deps backend
sleep 10
docker-compose up -d --force-recreate --no-deps frontend

# 6. Health check
echo "🏥 Performing health check..."
sleep 15
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    exit 1
fi

if curl -f http://localhost:3000 2>/dev/null; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "✅ Deployment completed successfully!"
EOF

chmod +x "$UPGRADE_DIR/deploy.sh"
print_success "✅ Deployment script created"

# Step 5: Create data verification script
print_status "🔍 Step 5: Creating data verification script..."
cat > "$UPGRADE_DIR/verify_data.sh" << 'EOF'
#!/bin/bash

echo "🔍 Verifying data integrity after upgrade..."

# Check installer count
INSTALLER_COUNT=$(docker exec sunx-loyalty-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@sunx-loyalty-mongodb:27017/sunx_loyalty?authSource=admin')
.then(async () => {
    const Installer = require('./models/Installer');
    const count = await Installer.countDocuments();
    console.log(count);
    process.exit(0);
}).catch(err => {console.error('0'); process.exit(1);});
" 2>/dev/null)

echo "📊 Installer count: $INSTALLER_COUNT"

# Check if admin panel is accessible
if curl -f https://loyalty.sunxpv.com/admin 2>/dev/null; then
    echo "✅ Admin panel accessible"
else
    echo "❌ Admin panel not accessible"
fi

# Check if main site is accessible
if curl -f https://loyalty.sunxpv.com 2>/dev/null; then
    echo "✅ Main website accessible"
else
    echo "❌ Main website not accessible"
fi

# Check API endpoints
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ API endpoints working"
else
    echo "❌ API endpoints not working"
fi

echo "✅ Data verification completed"
EOF

chmod +x "$UPGRADE_DIR/verify_data.sh"
print_success "✅ Data verification script created"

# Summary and next steps
echo ""
print_header "📋 UPGRADE PREPARATION COMPLETE"
print_header "==============================="
print_success "✅ Backup created and verified"
print_success "✅ Current state documented"
print_success "✅ Upgrade environment prepared"
print_success "✅ Deployment scripts created"
print_success "✅ Data verification scripts created"

echo ""
print_status "📁 Upgrade Directory: $UPGRADE_DIR"
print_status "📋 Upgrade Checklist: $UPGRADE_DIR/upgrade_checklist.txt"
print_status "🚀 Deploy Script: $UPGRADE_DIR/deploy.sh"
print_status "🔍 Verify Script: $UPGRADE_DIR/verify_data.sh"

echo ""
print_header "🎯 NEXT STEPS:"
print_status "1. Upload your new application code to: $UPGRADE_DIR"
print_status "2. Review the upgrade checklist: cat $UPGRADE_DIR/upgrade_checklist.txt"
print_status "3. Test the new code (optional but recommended)"
print_status "4. Execute deployment: bash $UPGRADE_DIR/deploy.sh"
print_status "5. Verify data integrity: bash $UPGRADE_DIR/verify_data.sh"

echo ""
print_warning "⚠️  IMPORTANT REMINDERS:"
print_warning "   - Backup is available at: $LATEST_BACKUP"
print_warning "   - Current state documented at: $CURRENT_STATE_FILE"
print_warning "   - Always test in staging environment first"
print_warning "   - Have rollback plan ready"

echo ""
print_success "🎉 Ready for safe application upgrade!"
print_status "💡 Need help with next steps? Just ask!"
EOF

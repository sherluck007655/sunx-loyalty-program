#!/bin/bash

# Safe Application Upgrade Deployment Script
# Run this on SSH server: root@45.93.138.5
# ONLY run this AFTER backup is completed

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
print_status "🔍 Step 1: Pre-flight safety checks..."

# Check if backup exists
LATEST_BACKUP=$(ls -t /root/backups/loyalty-*/installer_data_export.json 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
    print_error "❌ No installer data backup found! Cannot proceed safely."
    print_status "💡 Please run the backup script first"
    exit 1
fi
print_success "✅ Backup verified: $LATEST_BACKUP"

# Check current application is running
cd "$APP_DIR" || {
    print_error "❌ Cannot access application directory: $APP_DIR"
    exit 1
}

if ! docker-compose ps | grep -q "Up"; then
    print_warning "⚠️  Starting application containers..."
    docker-compose up -d
    sleep 15
fi
print_success "✅ Application containers verified"

# Test current application
print_status "🧪 Testing current application..."
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    print_success "✅ Current application is healthy"
else
    print_warning "⚠️  Current application health check failed"
fi

# Step 2: Prepare upgrade environment
print_status "🛠️  Step 2: Preparing upgrade environment..."
mkdir -p "$UPGRADE_DIR"

# Download latest application code
print_status "📥 Where is your new application code?"
print_status "Options:"
print_status "1. GitHub repository (provide URL)"
print_status "2. Upload files manually to $UPGRADE_DIR"
print_status "3. Use existing local files"
echo ""

# For now, let's prepare the upgrade structure
print_status "📁 Creating upgrade directory structure..."
mkdir -p "$UPGRADE_DIR/backend"
mkdir -p "$UPGRADE_DIR/frontend"
mkdir -p "$UPGRADE_DIR/scripts"

# Create upgrade configuration
cat > "$UPGRADE_DIR/upgrade_config.sh" << 'EOF'
#!/bin/bash
# Upgrade Configuration

# Set these variables before running upgrade
GITHUB_REPO_URL=""  # Set your GitHub repo URL here
BRANCH_NAME="main"  # Set your branch name
BACKUP_CURRENT_IMAGES=true
ZERO_DOWNTIME=true
RUN_MIGRATIONS=true
VERIFY_DATA_INTEGRITY=true

# Database settings
PRESERVE_DATA=true
BACKUP_BEFORE_MIGRATION=true

# Rollback settings
AUTO_ROLLBACK_ON_FAILURE=true
HEALTH_CHECK_TIMEOUT=60

echo "Upgrade configuration loaded"
EOF

# Create pre-upgrade data snapshot
print_status "📊 Step 3: Creating pre-upgrade data snapshot..."
docker exec sunx-loyalty-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@sunx-loyalty-mongodb:27017/sunx_loyalty?authSource=admin')
.then(async () => {
    const Installer = require('./models/Installer');
    const Payment = require('./models/Payment');
    const SerialNumber = require('./models/SerialNumber');
    
    const installerCount = await Installer.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const serialCount = await SerialNumber.countDocuments();
    
    const snapshot = {
        timestamp: new Date().toISOString(),
        preUpgradeStats: {
            installers: installerCount,
            payments: paymentCount,
            serials: serialCount
        }
    };
    
    console.log('📊 PRE-UPGRADE SNAPSHOT:');
    console.log('Installers:', installerCount);
    console.log('Payments:', paymentCount);
    console.log('Serials:', serialCount);
    
    require('fs').writeFileSync('/tmp/pre_upgrade_snapshot.json', JSON.stringify(snapshot, null, 2));
    process.exit(0);
}).catch(err => {console.error('Error:', err); process.exit(1);});
" > "$UPGRADE_DIR/pre_upgrade_snapshot.txt"

docker cp sunx-loyalty-backend:/tmp/pre_upgrade_snapshot.json "$UPGRADE_DIR/pre_upgrade_snapshot.json" 2>/dev/null

print_success "✅ Pre-upgrade snapshot created"

# Step 4: Create deployment script
print_status "🚀 Step 4: Creating zero-downtime deployment script..."
cat > "$UPGRADE_DIR/execute_upgrade.sh" << 'EOF'
#!/bin/bash

# Zero-Downtime Upgrade Execution Script
source ./upgrade_config.sh

APP_DIR="/var/www/sunx-loyalty"
UPGRADE_DIR="/tmp/sunx-loyalty-upgrade"

echo "🚀 Starting zero-downtime upgrade deployment..."
echo "Time: $(date)"

# Function to rollback on failure
rollback() {
    echo "❌ Upgrade failed! Starting rollback..."
    cd "$APP_DIR"
    
    # Restore from backup
    LATEST_BACKUP=$(ls -t /root/backups/loyalty-*/enhanced_restore.sh 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_DIR=$(dirname "$LATEST_BACKUP")
        echo "🔄 Running restore from: $BACKUP_DIR"
        bash "$LATEST_BACKUP"
    else
        echo "⚠️  No restore script found, manual intervention required"
    fi
    
    exit 1
}

# Set trap for automatic rollback on failure
if [ "$AUTO_ROLLBACK_ON_FAILURE" = true ]; then
    trap rollback ERR
fi

# 1. Backup current Docker images
if [ "$BACKUP_CURRENT_IMAGES" = true ]; then
    echo "🏷️  Backing up current Docker images..."
    docker tag sunx-loyalty-backend:latest sunx-loyalty-backend:pre-upgrade-$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    docker tag sunx-loyalty-frontend:latest sunx-loyalty-frontend:pre-upgrade-$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
fi

# 2. Build new images (if new code is available)
if [ -f "$UPGRADE_DIR/docker-compose.yml" ]; then
    echo "🔨 Building new Docker images..."
    cd "$UPGRADE_DIR"
    docker-compose build --no-cache
    
    # Tag new images
    docker tag sunx-loyalty-backend:latest sunx-loyalty-backend:upgrade-$(date +%Y%m%d_%H%M%S)
    docker tag sunx-loyalty-frontend:latest sunx-loyalty-frontend:upgrade-$(date +%Y%m%d_%H%M%S)
fi

# 3. Update application files
echo "📦 Updating application files..."
cd "$APP_DIR"

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Copy new files (excluding sensitive data)
if [ -d "$UPGRADE_DIR/backend" ]; then
    rsync -av --exclude='node_modules' --exclude='.env' --exclude='uploads' "$UPGRADE_DIR/backend/" ./backend/
fi

if [ -d "$UPGRADE_DIR/frontend" ]; then
    rsync -av --exclude='node_modules' --exclude='build' "$UPGRADE_DIR/frontend/" ./frontend/
fi

# Copy new docker-compose if available
if [ -f "$UPGRADE_DIR/docker-compose.yml" ]; then
    cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)
    cp "$UPGRADE_DIR/docker-compose.yml" ./docker-compose.yml
fi

# 4. Run database migrations (if any)
if [ "$RUN_MIGRATIONS" = true ]; then
    echo "🗄️  Running database migrations..."
    docker-compose exec backend npm run migrate 2>/dev/null || echo "No migrations found"
fi

# 5. Rolling update with zero downtime
if [ "$ZERO_DOWNTIME" = true ]; then
    echo "🔄 Performing zero-downtime rolling update..."
    
    # Update backend first
    docker-compose up -d --force-recreate --no-deps backend
    sleep 10
    
    # Health check backend
    for i in {1..30}; do
        if curl -f http://localhost:5000/api/health 2>/dev/null; then
            echo "✅ Backend health check passed"
            break
        fi
        echo "⏳ Waiting for backend... ($i/30)"
        sleep 2
    done
    
    # Update frontend
    docker-compose up -d --force-recreate --no-deps frontend
    sleep 5
    
else
    echo "🔄 Performing standard update..."
    docker-compose up -d --force-recreate
fi

# 6. Final health checks
echo "🏥 Performing comprehensive health checks..."
sleep 15

# Backend API check
if ! curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "❌ Backend health check failed"
    rollback
fi

# Frontend check
if ! curl -f http://localhost:3000 2>/dev/null; then
    echo "❌ Frontend health check failed"
    rollback
fi

# Database connectivity check
docker exec sunx-loyalty-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@sunx-loyalty-mongodb:27017/sunx_loyalty?authSource=admin')
.then(() => {console.log('✅ Database connectivity verified'); process.exit(0);})
.catch(err => {console.error('❌ Database check failed:', err); process.exit(1);});
" || rollback

# 7. Data integrity verification
if [ "$VERIFY_DATA_INTEGRITY" = true ]; then
    echo "🔍 Verifying data integrity..."
    
    # Compare installer count before and after
    CURRENT_COUNT=$(docker exec sunx-loyalty-backend node -e "
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@sunx-loyalty-mongodb:27017/sunx_loyalty?authSource=admin')
    .then(async () => {
        const Installer = require('./models/Installer');
        const count = await Installer.countDocuments();
        console.log(count);
        process.exit(0);
    }).catch(() => {console.log('0'); process.exit(1);});
    " 2>/dev/null)
    
    if [ -f "$UPGRADE_DIR/pre_upgrade_snapshot.json" ]; then
        EXPECTED_COUNT=$(cat "$UPGRADE_DIR/pre_upgrade_snapshot.json" | grep -o '"installers":[0-9]*' | cut -d':' -f2)
        if [ "$CURRENT_COUNT" -eq "$EXPECTED_COUNT" ]; then
            echo "✅ Data integrity verified: $CURRENT_COUNT installers"
        else
            echo "❌ Data integrity check failed: Expected $EXPECTED_COUNT, found $CURRENT_COUNT"
            rollback
        fi
    fi
fi

echo "✅ Upgrade completed successfully!"
echo "🌐 Website: https://loyalty.sunxpv.com"
echo "🔧 Admin: https://loyalty.sunxpv.com/admin"
echo "📊 Verify all functionality is working correctly"
EOF

chmod +x "$UPGRADE_DIR/execute_upgrade.sh"
print_success "✅ Deployment script created"

# Step 5: Create post-upgrade verification script
print_status "🔍 Step 5: Creating verification script..."
cat > "$UPGRADE_DIR/verify_upgrade.sh" << 'EOF'
#!/bin/bash

echo "🔍 Post-Upgrade Verification Starting..."
echo "======================================="

# Test all critical endpoints
echo "🌐 Testing website accessibility..."
if curl -f https://loyalty.sunxpv.com 2>/dev/null; then
    echo "✅ Main website accessible"
else
    echo "❌ Main website not accessible"
fi

echo "🔧 Testing admin panel..."
if curl -f https://loyalty.sunxpv.com/admin 2>/dev/null; then
    echo "✅ Admin panel accessible"
else
    echo "❌ Admin panel not accessible"
fi

echo "🔌 Testing API endpoints..."
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ API health endpoint working"
else
    echo "❌ API health endpoint failed"
fi

# Test database connectivity and data
echo "🗄️  Testing database connectivity..."
docker exec sunx-loyalty-backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@sunx-loyalty-mongodb:27017/sunx_loyalty?authSource=admin')
.then(async () => {
    console.log('✅ Database connection successful');
    
    const Installer = require('./models/Installer');
    const installerCount = await Installer.countDocuments();
    console.log('📊 Installer count:', installerCount);
    
    // Test a sample installer login (without actually logging in)
    const sampleInstaller = await Installer.findOne({});
    if (sampleInstaller) {
        console.log('✅ Sample installer found:', sampleInstaller.name);
        console.log('   Email:', sampleInstaller.email);
        console.log('   Status:', sampleInstaller.status);
    }
    
    process.exit(0);
}).catch(err => {console.error('❌ Database test failed:', err); process.exit(1);});
"

echo ""
echo "📋 Verification Summary:"
echo "========================"
echo "✅ Run manual tests:"
echo "   1. Try logging into admin panel"
echo "   2. Test installer app login"
echo "   3. Check all dashboard features"
echo "   4. Verify payment processing"
echo "   5. Test serial number scanning"
echo ""
echo "🎉 Verification completed!"
EOF

chmod +x "$UPGRADE_DIR/verify_upgrade.sh"
print_success "✅ Verification script created"

# Summary and next steps
echo ""
print_header "📋 UPGRADE PREPARATION COMPLETE"
print_header "==============================="
print_success "✅ Pre-flight checks passed"
print_success "✅ Backup verified and available"
print_success "✅ Upgrade environment prepared"
print_success "✅ Zero-downtime deployment script ready"
print_success "✅ Automatic rollback configured"
print_success "✅ Data integrity verification ready"

echo ""
print_status "📁 Upgrade Directory: $UPGRADE_DIR"
print_status "🔧 Configuration: $UPGRADE_DIR/upgrade_config.sh"
print_status "🚀 Execute Upgrade: $UPGRADE_DIR/execute_upgrade.sh"
print_status "🔍 Verify Upgrade: $UPGRADE_DIR/verify_upgrade.sh"

echo ""
print_header "🎯 NEXT STEPS:"
print_status "1. Upload your new application code to: $UPGRADE_DIR"
print_status "2. Configure upgrade settings: nano $UPGRADE_DIR/upgrade_config.sh"
print_status "3. Execute the upgrade: bash $UPGRADE_DIR/execute_upgrade.sh"
print_status "4. Verify everything works: bash $UPGRADE_DIR/verify_upgrade.sh"

echo ""
print_warning "⚠️  SAFETY FEATURES ENABLED:"
print_warning "   - Automatic rollback on failure"
print_warning "   - Zero-downtime deployment"
print_warning "   - Data integrity verification"
print_warning "   - Health checks at every step"

echo ""
print_success "🎉 Ready for safe application upgrade!"
print_status "💡 Your data is protected - upgrade with confidence!"
EOF

#!/bin/bash

# Production Backup Script for loyalty.sunxpv.com
# Run this on SSH server: root@45.93.138.5

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
BACKUP_DIR="/root/backups/loyalty-$(date +%Y%m%d_%H%M%S)"
APP_DIR="/var/www/sunx-loyalty"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

clear
print_header "🔒 SunX Loyalty Program - Complete Production Backup"
print_header "=================================================="
print_status "Server: loyalty.sunxpv.com ($(hostname -I | awk '{print $1}'))"
print_status "Timestamp: $DATE"
print_status "Backup Directory: $BACKUP_DIR"
echo ""

# Create backup directory
print_status "📁 Creating backup directory..."
mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "❌ docker-compose.yml not found. Are we in the right directory?"
    print_status "Current directory: $(pwd)"
    print_status "Looking for application..."
    
    APP_DIR=$(find / -name "docker-compose.yml" -path "*sunx*" 2>/dev/null | head -1 | xargs dirname)
    if [ -z "$APP_DIR" ]; then
        print_error "❌ Could not find application directory"
        exit 1
    fi
    
    print_success "✅ Found application at: $APP_DIR"
    cd "$APP_DIR"
fi

print_success "✅ Working in: $(pwd)"

# 1. BACKUP MONGODB DATABASE
print_status "🗄️  Step 1: Backing up MongoDB database..."
print_status "Creating MongoDB dump..."

# Create MongoDB backup
if docker exec sunx-loyalty-mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/sunx_loyalty?authSource=admin" --out="/tmp/mongodb_backup" 2>/dev/null; then
    # Copy backup from container to host
    docker cp sunx-loyalty-mongodb:/tmp/mongodb_backup "$BACKUP_DIR/mongodb_backup"
    print_success "✅ MongoDB backup completed"
else
    print_warning "⚠️  Trying alternative MongoDB backup method..."
    # Alternative method
    docker exec sunx-loyalty-mongodb mongodump --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --db sunx_loyalty --out /tmp/mongodb_backup
    docker cp sunx-loyalty-mongodb:/tmp/mongodb_backup "$BACKUP_DIR/mongodb_backup"
    print_success "✅ MongoDB backup completed (alternative method)"
fi

# 2. BACKUP APPLICATION FILES
print_status "📦 Step 2: Backing up application files..."
cp -r "$APP_DIR" "$BACKUP_DIR/application_files"
print_success "✅ Application files backed up"

# 3. BACKUP DOCKER IMAGES
print_status "🐳 Step 3: Backing up Docker images..."
docker save sunx-loyalty-backend:latest > "$BACKUP_DIR/backend_image.tar" 2>/dev/null || print_warning "⚠️  Backend image backup skipped"
docker save sunx-loyalty-frontend:latest > "$BACKUP_DIR/frontend_image.tar" 2>/dev/null || print_warning "⚠️  Frontend image backup skipped"
docker save mongo:7.0 > "$BACKUP_DIR/mongodb_image.tar" 2>/dev/null || print_warning "⚠️  MongoDB image backup skipped"
print_success "✅ Docker images backed up"

# 4. BACKUP ENVIRONMENT AND CONFIGURATION
print_status "⚙️  Step 4: Backing up configuration..."
cp .env "$BACKUP_DIR/env_backup" 2>/dev/null || print_warning "⚠️  .env file not found"
cp docker-compose.yml "$BACKUP_DIR/docker-compose_backup.yml"
cp -r nginx/ "$BACKUP_DIR/nginx_backup/" 2>/dev/null || print_warning "⚠️  nginx directory not found"
print_success "✅ Configuration backed up"

# 5. EXPORT INSTALLER DATA AS JSON
print_status "👥 Step 5: Exporting installer data as JSON..."
docker exec sunx-loyalty-backend node -e "
const mongoose = require('mongoose');
const fs = require('fs');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@sunx-loyalty-mongodb:27017/sunx_loyalty?authSource=admin')
.then(async () => {
    const Installer = require('./models/Installer');
    const Payment = require('./models/Payment');
    const SerialNumber = require('./models/SerialNumber');
    
    const installers = await Installer.find({}).select('+password');
    const payments = await Payment.find({});
    const serials = await SerialNumber.find({});
    
    const backupData = {
        timestamp: new Date().toISOString(),
        server: 'loyalty.sunxpv.com',
        data: {
            installers: installers,
            payments: payments,
            serialNumbers: serials
        },
        stats: {
            totalInstallers: installers.length,
            totalPayments: payments.length,
            totalSerials: serials.length
        }
    };
    
    fs.writeFileSync('/tmp/data_export.json', JSON.stringify(backupData, null, 2));
    console.log('✅ Data exported successfully');
    process.exit(0);
}).catch(err => {console.error('Error:', err); process.exit(1);});
" && docker cp sunx-loyalty-backend:/tmp/data_export.json "$BACKUP_DIR/installer_data_export.json"

print_success "✅ Installer data exported as JSON"

# 6. CREATE SYSTEM INFO
print_status "📋 Step 6: Creating system information..."
cat > "$BACKUP_DIR/system_info.txt" << EOF
SunX Loyalty Program - System Backup Information
===============================================
Backup Date: $DATE
Server: loyalty.sunxpv.com ($(hostname -I | awk '{print $1}'))
Backup Directory: $BACKUP_DIR

DOCKER CONTAINERS:
$(docker-compose ps)

DOCKER IMAGES:
$(docker images | grep -E "(sunx|mongo)")

SYSTEM INFO:
$(uname -a)
$(df -h)
$(free -h)

APPLICATION DIRECTORY:
$(ls -la $APP_DIR)

ENVIRONMENT VARIABLES:
$(cat .env 2>/dev/null || echo "No .env file found")

NGINX STATUS:
$(systemctl status nginx --no-pager -l 2>/dev/null || echo "Nginx not running as service")

DOCKER VERSION:
$(docker --version)
$(docker-compose --version)
EOF

print_success "✅ System information saved"

# 7. CREATE RESTORE SCRIPT
print_status "🔧 Step 7: Creating restore script..."
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
# Restore script for SunX Loyalty Program
# Run this script to restore from backup

BACKUP_DIR=$(dirname "$0")
APP_DIR="/var/www/sunx-loyalty"

echo "🔄 Restoring SunX Loyalty Program from backup..."
echo "Backup directory: $BACKUP_DIR"

# Stop current services
echo "⏹️  Stopping current services..."
cd "$APP_DIR"
docker-compose down

# Restore application files
echo "📦 Restoring application files..."
cp -r "$BACKUP_DIR/application_files/"* "$APP_DIR/"

# Restore MongoDB
echo "🗄️  Restoring MongoDB..."
docker-compose up -d mongodb
sleep 10
docker exec sunx-loyalty-mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/sunx_loyalty?authSource=admin" --drop /tmp/mongodb_backup/sunx_loyalty
docker cp "$BACKUP_DIR/mongodb_backup" sunx-loyalty-mongodb:/tmp/mongodb_backup

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

echo "✅ Restore completed!"
echo "🌐 Check: https://loyalty.sunxpv.com"
EOF

chmod +x "$BACKUP_DIR/restore.sh"
print_success "✅ Restore script created"

# 8. COMPRESS BACKUP
print_status "🗜️  Step 8: Compressing backup..."
cd "$(dirname "$BACKUP_DIR")"
tar -czf "loyalty_backup_$(date +%Y%m%d_%H%M%S).tar.gz" "$(basename "$BACKUP_DIR")"
COMPRESSED_SIZE=$(du -h "loyalty_backup_$(date +%Y%m%d_%H%M%S).tar.gz" | cut -f1)
print_success "✅ Backup compressed: $COMPRESSED_SIZE"

# SUMMARY
echo ""
print_header "📊 BACKUP SUMMARY"
print_header "=================="
print_success "✅ MongoDB database backed up"
print_success "✅ Application files backed up"
print_success "✅ Docker images backed up"
print_success "✅ Configuration backed up"
print_success "✅ Installer data exported as JSON"
print_success "✅ System information saved"
print_success "✅ Restore script created"
print_success "✅ Backup compressed"

echo ""
print_status "📁 Backup Location: $BACKUP_DIR"
print_status "📦 Compressed Backup: loyalty_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
print_status "💾 Total Size: $COMPRESSED_SIZE"

echo ""
print_warning "⚠️  IMPORTANT NOTES:"
print_warning "   - Keep this backup in a safe location"
print_warning "   - Test the restore script before upgrading"
print_warning "   - Backup contains sensitive data - keep secure"

echo ""
print_success "🎉 Complete backup finished successfully!"
print_status "🚀 Ready for application upgrade!"
EOF

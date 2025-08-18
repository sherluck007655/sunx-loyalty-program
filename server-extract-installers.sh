#!/bin/bash

# SunX Loyalty Program - Server Installer Credentials Extractor
# For production server: loyalty.sunxpv.com (45.93.138.5)
# Run this script on the SSH server as root

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

print_info() {
    echo -e "${CYAN}$1${NC}"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

clear
echo ""
print_header "🔍 SunX Loyalty Program - Production Server Installer Extractor"
print_header "=================================================================="
print_info "Server: loyalty.sunxpv.com (45.93.138.5)"
print_info "Timestamp: $(date)"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "❌ This script must be run as root (you are logged in as root via SSH)"
    exit 1
fi

# Find the application directory
APP_DIRS=("/var/www/sunx-loyalty" "/opt/sunx-loyalty" "/home/sunx-loyalty" "/root/sunx-loyalty")
APP_DIR=""

print_status "🔍 Searching for application directory..."
for dir in "${APP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        APP_DIR="$dir"
        print_success "✅ Found application at: $APP_DIR"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    print_error "❌ Application directory not found. Checking common locations..."
    print_info "Searching in current directory and subdirectories..."
    
    # Search for docker-compose.yml or package.json to find the app
    FOUND_COMPOSE=$(find / -name "docker-compose.yml" -path "*/sunx*" 2>/dev/null | head -1)
    if [ ! -z "$FOUND_COMPOSE" ]; then
        APP_DIR=$(dirname "$FOUND_COMPOSE")
        print_success "✅ Found application via docker-compose.yml at: $APP_DIR"
    else
        print_error "❌ Could not locate the SunX Loyalty application directory"
        print_info "Please manually navigate to your application directory and run:"
        print_info "cd /path/to/your/sunx-loyalty && bash server-extract-installers.sh"
        exit 1
    fi
fi

cd "$APP_DIR"
print_status "📂 Working directory: $(pwd)"

# Check if Docker is running
print_status "🐳 Checking Docker status..."
if ! command -v docker &> /dev/null; then
    print_error "❌ Docker is not installed"
    exit 1
fi

if ! systemctl is-active --quiet docker; then
    print_warning "⚠️  Docker service is not running. Starting Docker..."
    systemctl start docker
    sleep 3
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "❌ Docker Compose is not installed"
    exit 1
fi

# Check running containers
print_status "📋 Checking running containers..."
docker-compose ps

# Create the extraction script for the container
print_status "📝 Creating extraction script..."
cat > extract_installers_production.js << 'EOF'
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Installer model
const Installer = require('./models/Installer');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password123@mongodb:27017/sunx_loyalty?authSource=admin';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected to Production Database');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Extract all installers with their credentials
const extractInstallers = async () => {
  try {
    console.log('🔍 Extracting all installer credentials from PRODUCTION...');
    console.log('=' .repeat(80));

    // Get all installers with passwords (explicitly include password field)
    const installers = await Installer.find({}).select('+password');

    if (installers.length === 0) {
      console.log('❌ No installers found in the production database');
      return;
    }

    console.log(`📊 Found ${installers.length} installer(s) in PRODUCTION\n`);

    // Format for SSH access
    console.log('🔐 PRODUCTION INSTALLER CREDENTIALS');
    console.log('=' .repeat(80));
    console.log('Production Server: loyalty.sunxpv.com (45.93.138.5)');
    console.log('SSH Access: ssh root@45.93.138.5');
    console.log('Web Access: https://loyalty.sunxpv.com');
    console.log('=' .repeat(80));

    // Display installer information
    installers.forEach((installer, index) => {
      console.log(`\n${index + 1}. INSTALLER: ${installer.name}`);
      console.log(`   📧 Email: ${installer.email}`);
      console.log(`   📱 Phone: ${installer.phone}`);
      console.log(`   🆔 CNIC: ${installer.cnic}`);
      console.log(`   🎫 Loyalty Card ID: ${installer.loyaltyCardId}`);
      console.log(`   📊 Status: ${installer.status.toUpperCase()}`);
      console.log(`   ✅ Active: ${installer.isActive ? 'YES' : 'NO'}`);
      console.log(`   ✅ Verified: ${installer.isVerified ? 'YES' : 'NO'}`);
      console.log(`   🏆 Total Points: ${installer.totalPoints || 0}`);
      console.log(`   ⚡ Total Inverters: ${installer.totalInverters || 0}`);
      console.log(`   🏠 Address: ${installer.address}`);
      console.log(`   📅 Created: ${new Date(installer.createdAt).toLocaleString()}`);
      console.log(`   🕐 Last Login: ${installer.lastLogin ? new Date(installer.lastLogin).toLocaleString() : 'Never'}`);
      
      // Note about password (it's hashed, so we can't show the plain text)
      console.log(`   🔒 Password Hash: ${installer.password.substring(0, 20)}...`);
      console.log(`   ⚠️  Note: Password is hashed - use admin panel to reset if needed`);
      
      if (installer.bankDetails && installer.bankDetails.accountNumber) {
        console.log(`   🏦 Bank Details:`);
        console.log(`     💳 Account Title: ${installer.bankDetails.accountTitle}`);
        console.log(`     🔢 Account Number: ${installer.bankDetails.accountNumber}`);
        console.log(`     🏛️  Bank Name: ${installer.bankDetails.bankName}`);
        console.log(`     🏢 Branch Code: ${installer.bankDetails.branchCode}`);
      }
      
      console.log('   ' + '-'.repeat(70));
    });

    // Summary statistics
    console.log('\n📈 PRODUCTION SUMMARY STATISTICS');
    console.log('=' .repeat(80));
    const activeCount = installers.filter(i => i.isActive).length;
    const verifiedCount = installers.filter(i => i.isVerified).length;
    const approvedCount = installers.filter(i => i.status === 'approved').length;
    const pendingCount = installers.filter(i => i.status === 'pending').length;
    const totalPoints = installers.reduce((sum, i) => sum + (i.totalPoints || 0), 0);
    const totalInverters = installers.reduce((sum, i) => sum + (i.totalInverters || 0), 0);

    console.log(`📊 Total Installers: ${installers.length}`);
    console.log(`✅ Active Installers: ${activeCount}`);
    console.log(`✅ Verified Installers: ${verifiedCount}`);
    console.log(`✅ Approved Installers: ${approvedCount}`);
    console.log(`⏳ Pending Installers: ${pendingCount}`);
    console.log(`🏆 Total Points Earned: ${totalPoints.toLocaleString()}`);
    console.log(`⚡ Total Inverters Installed: ${totalInverters.toLocaleString()}`);

    // Access Information
    console.log('\n🔑 ACCESS INFORMATION');
    console.log('=' .repeat(80));
    console.log('🌐 Production Website: https://loyalty.sunxpv.com');
    console.log('🔧 Admin Panel: https://loyalty.sunxpv.com/admin');
    console.log('📱 Installer App: Available on Play Store/App Store');
    console.log('🖥️  SSH Server Access: ssh root@45.93.138.5');
    
    console.log('\n📝 INSTALLER LOGIN CREDENTIALS (for app/web)');
    console.log('-'.repeat(80));
    installers.forEach((installer, index) => {
      console.log(`${index + 1}. Login: ${installer.email} OR ${installer.phone}`);
      console.log(`   Status: ${installer.status} | Active: ${installer.isActive ? 'Yes' : 'No'}`);
      console.log(`   ⚠️  Password: [HASHED - Use admin panel to reset]`);
      console.log('');
    });

    console.log('✅ Production data extraction completed successfully!');

  } catch (error) {
    console.error('❌ Error extracting installer data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await extractInstallers();
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  main();
}
EOF

# Copy the script to the backend container and execute it
print_status "🚀 Executing installer extraction in production container..."
echo ""

# Method 1: Try with docker-compose exec
if docker-compose exec -T backend node -e "
const fs = require('fs');
const script = fs.readFileSync('/tmp/extract_installers_production.js', 'utf8');
eval(script);
" 2>/dev/null; then
    print_success "✅ Extraction completed via docker-compose"
else
    # Method 2: Copy script to container and run
    print_status "🔄 Trying alternative method..."
    
    # Copy script to backend container
    docker cp extract_installers_production.js $(docker-compose ps -q backend):/app/extract_production.js
    
    # Execute the script
    if docker-compose exec backend node extract_production.js; then
        print_success "✅ Extraction completed via container copy"
    else
        # Method 3: Direct MongoDB access
        print_warning "⚠️  Trying direct MongoDB access..."
        
        docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --eval "
        print('🔍 PRODUCTION INSTALLER DATA FROM MONGODB');
        print('==========================================');
        var installers = db.installers.find({});
        var count = 0;
        installers.forEach(function(installer) {
            count++;
            print('');
            print(count + '. INSTALLER: ' + installer.name);
            print('   Email: ' + installer.email);
            print('   Phone: ' + installer.phone);
            print('   CNIC: ' + installer.cnic);
            print('   Loyalty Card: ' + installer.loyaltyCardId);
            print('   Status: ' + installer.status);
            print('   Active: ' + installer.isActive);
            print('   Points: ' + (installer.totalPoints || 0));
            print('   Inverters: ' + (installer.totalInverters || 0));
            print('   Created: ' + installer.createdAt);
            print('   ----------------------------------------');
        });
        print('');
        print('📊 Total Installers Found: ' + count);
        print('🌐 Access: https://loyalty.sunxpv.com');
        print('🔧 SSH: ssh root@45.93.138.5');
        "
    fi
fi

# Cleanup
rm -f extract_installers_production.js

echo ""
print_success "🎉 Production installer extraction completed!"
print_info "💡 Additional useful commands:"
print_info "   - View containers: docker-compose ps"
print_info "   - View logs: docker-compose logs backend"
print_info "   - Restart services: docker-compose restart"
print_info "   - Access MongoDB: docker-compose exec mongodb mongo -u admin -p password123"

echo ""
print_warning "⚠️  SECURITY REMINDERS:"
print_warning "   - Keep this information confidential"
print_warning "   - Passwords are hashed and cannot be displayed in plain text"
print_warning "   - Use the admin panel at https://loyalty.sunxpv.com/admin to reset passwords"
print_warning "   - Monitor access logs regularly"

echo ""

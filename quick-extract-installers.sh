#!/bin/bash

# Quick Installer Extractor for loyalty.sunxpv.com
# Run this on SSH server: root@45.93.138.5

echo "🔍 SunX Loyalty Program - Quick Installer Extractor"
echo "=================================================="
echo "Server: loyalty.sunxpv.com ($(hostname -I | awk '{print $1}'))"
echo "Date: $(date)"
echo ""

# Find application directory
APP_DIR=""
for dir in /var/www/sunx-loyalty /opt/sunx-loyalty /home/sunx-loyalty /root/sunx-loyalty; do
    if [ -d "$dir" ]; then
        APP_DIR="$dir"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    echo "❌ Application directory not found. Searching..."
    APP_DIR=$(find / -name "docker-compose.yml" -path "*sunx*" 2>/dev/null | head -1 | xargs dirname)
    if [ -z "$APP_DIR" ]; then
        echo "❌ Could not find application. Please run from app directory."
        exit 1
    fi
fi

echo "📂 Application found at: $APP_DIR"
cd "$APP_DIR"

# Check if containers are running
echo "🐳 Checking Docker containers..."
docker-compose ps

echo ""
echo "🔍 Extracting installer data from production database..."
echo "======================================================="

# Direct MongoDB query to extract installer information
docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --quiet --eval "
var installers = db.installers.find({});
var count = 0;
print('🔐 PRODUCTION INSTALLER CREDENTIALS');
print('===================================');
print('Server: loyalty.sunxpv.com (45.93.138.5)');
print('SSH: ssh root@45.93.138.5');
print('Web: https://loyalty.sunxpv.com');
print('Admin: https://loyalty.sunxpv.com/admin');
print('===================================');
print('');

installers.forEach(function(installer) {
    count++;
    print(count + '. INSTALLER: ' + installer.name);
    print('   📧 Email: ' + installer.email);
    print('   📱 Phone: ' + installer.phone);
    print('   🆔 CNIC: ' + installer.cnic);
    print('   🎫 Card ID: ' + installer.loyaltyCardId);
    print('   📊 Status: ' + installer.status.toUpperCase());
    print('   ✅ Active: ' + (installer.isActive ? 'YES' : 'NO'));
    print('   ✅ Verified: ' + (installer.isVerified ? 'YES' : 'NO'));
    print('   🏆 Points: ' + (installer.totalPoints || 0));
    print('   ⚡ Inverters: ' + (installer.totalInverters || 0));
    print('   🏠 Address: ' + installer.address);
    print('   📅 Created: ' + installer.createdAt.toISOString().split('T')[0]);
    if (installer.lastLogin) {
        print('   🕐 Last Login: ' + installer.lastLogin.toISOString().split('T')[0]);
    } else {
        print('   🕐 Last Login: Never');
    }
    print('   🔒 Password: [HASHED - Use admin panel to reset]');
    
    if (installer.bankDetails && installer.bankDetails.accountNumber) {
        print('   🏦 Bank: ' + installer.bankDetails.bankName);
        print('   💳 Account: ' + installer.bankDetails.accountNumber);
        print('   👤 Title: ' + installer.bankDetails.accountTitle);
    }
    print('   ' + Array(60).join('-'));
    print('');
});

// Summary statistics
var activeCount = 0;
var verifiedCount = 0;
var approvedCount = 0;
var pendingCount = 0;
var totalPoints = 0;
var totalInverters = 0;

db.installers.find({}).forEach(function(installer) {
    if (installer.isActive) activeCount++;
    if (installer.isVerified) verifiedCount++;
    if (installer.status === 'approved') approvedCount++;
    if (installer.status === 'pending') pendingCount++;
    totalPoints += (installer.totalPoints || 0);
    totalInverters += (installer.totalInverters || 0);
});

print('📈 PRODUCTION SUMMARY');
print('====================');
print('📊 Total Installers: ' + count);
print('✅ Active: ' + activeCount);
print('✅ Verified: ' + verifiedCount);
print('✅ Approved: ' + approvedCount);
print('⏳ Pending: ' + pendingCount);
print('🏆 Total Points: ' + totalPoints.toLocaleString());
print('⚡ Total Inverters: ' + totalInverters.toLocaleString());
print('');

print('🔑 LOGIN INFORMATION');
print('===================');
print('For installer app/web login:');
var loginCount = 0;
db.installers.find({}).forEach(function(installer) {
    loginCount++;
    print(loginCount + '. Email: ' + installer.email + ' OR Phone: ' + installer.phone);
    print('   Status: ' + installer.status + ' | Active: ' + (installer.isActive ? 'Yes' : 'No'));
});
print('');
print('⚠️  All passwords are hashed for security.');
print('⚠️  Use admin panel to reset installer passwords.');
print('');
print('✅ Extraction completed successfully!');
"

echo ""
echo "💡 Useful Commands:"
echo "=================="
echo "• View running containers: docker-compose ps"
echo "• View backend logs: docker-compose logs backend"
echo "• Access MongoDB shell: docker-compose exec mongodb mongo -u admin -p password123"
echo "• Restart application: docker-compose restart"
echo "• View system resources: htop"
echo "• Check disk space: df -h"

echo ""
echo "🌐 Access Points:"
echo "================"
echo "• Website: https://loyalty.sunxpv.com"
echo "• Admin Panel: https://loyalty.sunxpv.com/admin"
echo "• SSH Server: ssh root@45.93.138.5"
echo "• Server IP: $(hostname -I | awk '{print $1}')"

echo ""
echo "⚠️  Security Notes:"
echo "=================="
echo "• Passwords are encrypted and cannot be shown in plain text"
echo "• Use the admin panel to reset installer passwords if needed"
echo "• Keep this information confidential"
echo "• Monitor access logs regularly"

echo ""
echo "🎉 Production installer extraction completed!"

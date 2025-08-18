# SSH Commands for loyalty.sunxpv.com (45.93.138.5)

## 🚀 Quick One-Liner Commands

### **1. Extract All Installer Data (Recommended)**
```bash
curl -s https://raw.githubusercontent.com/your-repo/main/quick-extract-installers.sh | bash
```

### **2. Direct MongoDB Query (Fastest)**
```bash
# Find your app directory first
cd $(find / -name "docker-compose.yml" -path "*sunx*" 2>/dev/null | head -1 | xargs dirname) && docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --eval "db.installers.find({}, {name:1, email:1, phone:1, cnic:1, loyaltyCardId:1, status:1, isActive:1, totalPoints:1, totalInverters:1, address:1, createdAt:1}).forEach(function(doc) { print('Name: ' + doc.name + ' | Email: ' + doc.email + ' | Phone: ' + doc.phone + ' | Status: ' + doc.status + ' | Active: ' + doc.isActive); });"
```

### **3. Simple Installer List**
```bash
# Navigate to app directory and run
cd /var/www/sunx-loyalty && docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --eval "print('=== INSTALLER LIST ==='); db.installers.find().forEach(function(i) { print(i.name + ' - ' + i.email + ' - ' + i.phone + ' - ' + i.status); });"
```

## 📋 Step-by-Step SSH Instructions

### **Step 1: Connect to SSH**
```bash
ssh root@45.93.138.5
```

### **Step 2: Find Application Directory**
```bash
# Check common locations
ls -la /var/www/sunx-loyalty
ls -la /opt/sunx-loyalty
ls -la /home/sunx-loyalty

# Or search for it
find / -name "docker-compose.yml" -path "*sunx*" 2>/dev/null
```

### **Step 3: Navigate to App Directory**
```bash
cd /var/www/sunx-loyalty  # or wherever you found it
```

### **Step 4: Check Running Containers**
```bash
docker-compose ps
```

### **Step 5: Extract Installer Data**
```bash
# Method A: Download and run the extraction script
wget https://raw.githubusercontent.com/your-repo/main/quick-extract-installers.sh
chmod +x quick-extract-installers.sh
./quick-extract-installers.sh

# Method B: Direct MongoDB query
docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --eval "
print('🔍 INSTALLER CREDENTIALS FOR loyalty.sunxpv.com');
print('===============================================');
var count = 0;
db.installers.find({}).forEach(function(installer) {
    count++;
    print('');
    print(count + '. ' + installer.name);
    print('   Email: ' + installer.email);
    print('   Phone: ' + installer.phone);
    print('   CNIC: ' + installer.cnic);
    print('   Card ID: ' + installer.loyaltyCardId);
    print('   Status: ' + installer.status);
    print('   Active: ' + installer.isActive);
    print('   Points: ' + (installer.totalPoints || 0));
    print('   Address: ' + installer.address);
    print('   Created: ' + installer.createdAt);
});
print('');
print('Total Installers: ' + count);
print('Website: https://loyalty.sunxpv.com');
print('SSH: ssh root@45.93.138.5');
"
```

## 🔧 Alternative Commands

### **If Docker Compose is not available:**
```bash
# Find MongoDB container
docker ps | grep mongo

# Connect directly to MongoDB container
docker exec -it [MONGO_CONTAINER_ID] mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty

# Then run in MongoDB shell:
db.installers.find().pretty()
```

### **If you need to check database collections:**
```bash
docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --eval "show collections"
```

### **To get installer count:**
```bash
docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --eval "print('Total Installers: ' + db.installers.count())"
```

## 📊 What You'll Get

The extraction will show for each installer:
- ✅ Full Name
- ✅ Email Address  
- ✅ Phone Number
- ✅ CNIC Number
- ✅ Loyalty Card ID
- ✅ Account Status (pending/approved/rejected)
- ✅ Active Status (true/false)
- ✅ Total Points Earned
- ✅ Total Inverters Installed
- ✅ Address
- ✅ Registration Date
- ✅ Last Login Date
- ✅ Bank Details (if provided)

## 🔐 Important Notes

1. **Passwords are hashed** - You cannot see plain text passwords
2. **Use admin panel** - To reset passwords, use https://loyalty.sunxpv.com/admin
3. **SSH Access** - The SSH is for server management, not installer app access
4. **Security** - Keep extracted data confidential

## 🚨 Emergency Commands

### **If containers are not running:**
```bash
cd /var/www/sunx-loyalty
docker-compose up -d
```

### **If you need to restart the application:**
```bash
docker-compose restart
```

### **To check logs if something is wrong:**
```bash
docker-compose logs backend
docker-compose logs mongodb
```

### **To backup database before making changes:**
```bash
docker-compose exec mongodb mongodump --archive > backup_$(date +%Y%m%d_%H%M%S).archive
```

## 🎯 Quick Copy-Paste Command

**For immediate results, copy and paste this single command:**

```bash
cd $(find / -name "docker-compose.yml" -path "*sunx*" 2>/dev/null | head -1 | xargs dirname 2>/dev/null || echo "/var/www/sunx-loyalty") && echo "📍 Working in: $(pwd)" && echo "🔍 Extracting installer data..." && docker-compose exec mongodb mongo -u admin -p password123 --authenticationDatabase admin sunx_loyalty --quiet --eval "print('🔐 INSTALLER CREDENTIALS - loyalty.sunxpv.com'); print('=========================================='); var count=0; db.installers.find({}).forEach(function(i){ count++; print(count + '. ' + i.name + ' | ' + i.email + ' | ' + i.phone + ' | ' + i.status + ' | Points: ' + (i.totalPoints||0)); }); print(''); print('Total: ' + count + ' installers'); print('SSH: ssh root@45.93.138.5'); print('Web: https://loyalty.sunxpv.com');"
```

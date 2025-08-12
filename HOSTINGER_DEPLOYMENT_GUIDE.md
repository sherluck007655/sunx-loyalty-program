# SunX Loyalty Program - Hostinger VPS Deployment Guide

## 🚀 Complete Step-by-Step Deployment

### **Prerequisites**
- ✅ Hostinger VPS with Ubuntu
- ✅ Docker installed on server
- ✅ Domain name (optional but recommended)
- ✅ SSH access to server

---

## **Step 1: Prepare Local Files for Upload**

### **1.1 Create Production Environment File**
Create a `.env.production` file in your project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://mongodb:27017/sunx_loyalty

# JWT Configuration  
JWT_SECRET=your-super-secure-production-jwt-key-change-this-now
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Admin Configuration (Change these!)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-admin-password

# Frontend Configuration
REACT_APP_API_URL=http://your-server-ip:5000/api
```

### **1.2 Create Production Docker Compose**
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: sunx-mongodb-prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure-mongo-password
      MONGO_INITDB_DATABASE: sunx_loyalty
    volumes:
      - mongodb_data:/data/db
      - ./backend/scripts/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    networks:
      - sunx-network
    ports:
      - "27017:27017"

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sunx-backend-prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:secure-mongo-password@mongodb:27017/sunx_loyalty?authSource=admin
      - JWT_SECRET=your-super-secure-production-jwt-key-change-this-now
      - JWT_EXPIRE=7d
      - PORT=5000
      - ADMIN_EMAIL=admin@yourdomain.com
      - ADMIN_PASSWORD=your-secure-admin-password
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - sunx-network
    volumes:
      - ./backend/uploads:/app/uploads

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - REACT_APP_API_URL=http://your-server-ip:5000/api
    container_name: sunx-frontend-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - sunx-network

volumes:
  mongodb_data:

networks:
  sunx-network:
    driver: bridge
```

### **1.3 Create Deployment Script**
Create `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting SunX Loyalty Program Deployment..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional)
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Seed database
echo "🌱 Seeding database..."
docker-compose -f docker-compose.prod.yml exec -T backend node scripts/seedData.js

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://your-server-ip"
echo "🔧 Backend API: http://your-server-ip:5000"
echo "📊 Health Check: http://your-server-ip:5000/health"
```

---

## **Step 2: Upload Files to Server**

### **2.1 Connect to Your Server**
```bash
# Replace with your server details
ssh root@your-server-ip
```

### **2.2 Create Application Directory**
```bash
# Create directory for the application
mkdir -p /var/www/sunx-loyalty
cd /var/www/sunx-loyalty
```

### **2.3 Upload Files (Choose One Method)**

#### **Method A: Using SCP (Recommended)**
From your local machine:
```bash
# Upload entire project
scp -r /path/to/your/sunx-loyalty-project/* root@your-server-ip:/var/www/sunx-loyalty/

# Or upload as zip
zip -r sunx-loyalty.zip . -x node_modules/\* .git/\*
scp sunx-loyalty.zip root@your-server-ip:/var/www/sunx-loyalty/
```

#### **Method B: Using Git**
On server:
```bash
# If you have the code in a Git repository
git clone https://github.com/yourusername/sunx-loyalty.git .
```

#### **Method C: Using SFTP**
```bash
# Use FileZilla or WinSCP to upload files
# Connect to: your-server-ip
# Username: root
# Upload to: /var/www/sunx-loyalty/
```

---

## **Step 3: Server Configuration**

### **3.1 Update System**
```bash
sudo apt update && sudo apt upgrade -y
```

### **3.2 Install Required Packages**
```bash
# Install Docker (if not already installed)
sudo apt install docker.io docker-compose -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
```

### **3.3 Configure Firewall**
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5000  # Backend API
sudo ufw enable
```

---

## **Step 4: Configure Environment**

### **4.1 Set Up Environment Variables**
```bash
cd /var/www/sunx-loyalty

# Copy production environment
cp .env.production .env

# Edit with your actual values
nano .env
```

Update these values:
```env
JWT_SECRET=your-actual-super-secure-jwt-secret-key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-actual-secure-admin-password
REACT_APP_API_URL=http://your-server-ip:5000/api
```

### **4.2 Update Docker Compose**
```bash
# Edit production compose file
nano docker-compose.prod.yml
```

Replace `your-server-ip` with your actual server IP address.

---

## **Step 5: Deploy Application**

### **5.1 Make Deploy Script Executable**
```bash
chmod +x deploy.sh
```

### **5.2 Run Deployment**
```bash
./deploy.sh
```

### **5.3 Monitor Deployment**
```bash
# Check container status
docker ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check specific service logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

---

## **Step 6: Verify Deployment**

### **6.1 Test Services**
```bash
# Test backend health
curl http://localhost:5000/health

# Test frontend
curl http://localhost

# Check database connection
docker-compose -f docker-compose.prod.yml exec mongodb mongo --eval "db.adminCommand('ismaster')"
```

### **6.2 Access Application**
- **Frontend**: `http://your-server-ip`
- **Backend API**: `http://your-server-ip:5000`
- **Health Check**: `http://your-server-ip:5000/health`

---

## **Step 7: Domain Configuration (Optional)**

### **7.1 Point Domain to Server**
In your domain registrar:
- Create A record: `yourdomain.com` → `your-server-ip`
- Create A record: `www.yourdomain.com` → `your-server-ip`

### **7.2 Update Environment Variables**
```bash
nano .env
```

Update:
```env
REACT_APP_API_URL=http://yourdomain.com:5000/api
```

### **7.3 Restart Services**
```bash
docker-compose -f docker-compose.prod.yml restart
```

---

## **Step 8: SSL Certificate (Recommended)**

### **8.1 Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### **8.2 Get SSL Certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## **Step 9: Monitoring & Maintenance**

### **9.1 Create Backup Script**
```bash
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sunx-loyalty"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.prod.yml exec -T mongodb mongodump --archive > $BACKUP_DIR/mongodb_$DATE.archive

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/sunx-loyalty

echo "Backup completed: $DATE"
```

### **9.2 Set Up Cron Jobs**
```bash
crontab -e
```

Add:
```bash
# Daily backup at 2 AM
0 2 * * * /var/www/sunx-loyalty/backup.sh

# Restart containers weekly
0 3 * * 0 cd /var/www/sunx-loyalty && docker-compose -f docker-compose.prod.yml restart
```

---

## **🔧 Troubleshooting**

### **Common Issues:**

#### **Port Already in Use**
```bash
sudo lsof -ti:80,5000,27017 | xargs sudo kill -9
```

#### **Permission Issues**
```bash
sudo chown -R $USER:$USER /var/www/sunx-loyalty
sudo chmod -R 755 /var/www/sunx-loyalty
```

#### **Container Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs [service-name]

# Restart specific service
docker-compose -f docker-compose.prod.yml restart [service-name]
```

#### **Database Connection Issues**
```bash
# Check MongoDB status
docker-compose -f docker-compose.prod.yml exec mongodb mongo --eval "db.runCommand({connectionStatus : 1})"
```

---

## **📋 Quick Commands Reference**

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restart services
docker-compose -f docker-compose.prod.yml restart

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update application
git pull && docker-compose -f docker-compose.prod.yml up --build -d

# Backup database
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --archive > backup.archive

# Restore database
docker-compose -f docker-compose.prod.yml exec -T mongodb mongorestore --archive < backup.archive
```

---

## **✅ Deployment Checklist**

- [ ] Server connected and updated
- [ ] Docker installed and running
- [ ] Files uploaded to server
- [ ] Environment variables configured
- [ ] Firewall configured
- [ ] Application deployed successfully
- [ ] Services accessible
- [ ] Database seeded
- [ ] Domain configured (if applicable)
- [ ] SSL certificate installed (if applicable)
- [ ] Backup system set up
- [ ] Monitoring configured

**Your SunX Loyalty Program is now live! 🎉**

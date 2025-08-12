# 🌞 SunX Loyalty Program - Complete Installation Guide

This comprehensive guide provides multiple ways to install and run the SunX Loyalty Program on your computer. Choose the method that works best for you.

## 🎯 Quick Overview

**Choose Your Installation Method:**

| Method | Difficulty | Best For | Time Required |
|--------|------------|----------|---------------|
| **Docker** | Easy | Beginners, Quick Setup | 15 minutes |
| **Local Development** | Medium | Developers, Customization | 30 minutes |
| **Production** | Advanced | Deployment, Scaling | 45 minutes |

---

## 🐳 Method 1: Docker Installation (Recommended for Beginners)

### Why Choose Docker?
- ✅ No need to install Node.js, MongoDB separately
- ✅ Everything runs in containers
- ✅ Easy to start and stop
- ✅ Consistent across all operating systems
- ✅ Quick setup

### Prerequisites
- Windows 10/11, macOS 10.14+, or Linux
- At least 4GB RAM
- 2GB free disk space

### Step 1: Install Docker Desktop

#### Windows:
1. **Download** Docker Desktop from https://www.docker.com/products/docker-desktop/
2. **Run** the installer and follow the wizard
3. **Restart** your computer
4. **Open** Docker Desktop and wait for it to start

#### Mac:
1. **Download** Docker Desktop for Mac
2. **Drag** to Applications folder
3. **Open** Docker Desktop
4. **Allow** necessary permissions

#### Linux (Ubuntu):
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
# Logout and login again
```

### Step 2: Verify Docker Installation
```bash
docker --version
docker-compose --version
```

### Step 3: Download Project Files
Make sure you have all the project files in a folder like:
```
C:\Users\YourName\Desktop\SunX-Loyalty-Program\
```

### Step 4: Configure Environment
1. **Copy** `.env.example` to `.env`
2. **Edit** `.env` file with these Docker settings:

```env
MONGODB_URI=mongodb://admin:password123@mongodb:27017/sunx_loyalty?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
ADMIN_EMAIL=admin@sunx.com
ADMIN_PASSWORD=admin123
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 5: Start the Application
```bash
# Navigate to project directory
cd "C:\Users\YourName\Desktop\SunX-Loyalty-Program"

# Start all services
docker-compose up --build
```

### Step 6: Add Sample Data
```bash
# In a new terminal/command prompt
docker-compose exec backend node scripts/seedData.js
```

### Step 7: Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Step 8: Test with Demo Accounts
- **Installer**: ahmed.ali@example.com / password123
- **Admin**: admin@sunx.com / admin123

### Stop the Application
```bash
# Press Ctrl+C, then run:
docker-compose down
```

---

## 💻 Method 2: Local Development Installation

### Why Choose Local Development?
- ✅ Full control over the environment
- ✅ Better for development and customization
- ✅ Easier debugging
- ✅ Can modify code in real-time

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git (optional)

### Step 1: Install Node.js
1. **Visit** https://nodejs.org/
2. **Download** LTS version
3. **Install** with default settings
4. **Verify**: `node --version` and `npm --version`

### Step 2: Install MongoDB

#### Option A: Local MongoDB
1. **Visit** https://www.mongodb.com/try/download/community
2. **Download** Community Server
3. **Install** with "Install as Service" checked
4. **Install** MongoDB Compass (GUI tool)

#### Option B: MongoDB Atlas (Cloud)
1. **Visit** https://www.mongodb.com/atlas
2. **Create** free account and cluster
3. **Get** connection string

### Step 3: Setup Project
```bash
# Navigate to project directory
cd "C:\Users\YourName\Desktop\SunX-Loyalty-Program"

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 4: Configure Environment
Create `.env` file in root directory:

```env
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/sunx_loyalty

# For MongoDB Atlas
# MONGODB_URI=your-atlas-connection-string

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
ADMIN_EMAIL=admin@sunx.com
ADMIN_PASSWORD=admin123
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 5: Start MongoDB (Local Only)
- **Windows**: MongoDB should start automatically as a service
- **Mac**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### Step 6: Seed Database
```bash
cd backend
node scripts/seedData.js
cd ..
```

### Step 7: Start the Application
```bash
# Start both frontend and backend
npm run dev

# OR start separately:
# Terminal 1: npm run server
# Terminal 2: npm run client
```

### Step 8: Access the Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## 🚀 Method 3: Production Deployment

### For Production Servers

#### Step 1: Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- 2GB+ RAM
- 20GB+ disk space
- Domain name (optional)

#### Step 2: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install nginx
```

#### Step 3: Setup Application
```bash
# Clone or upload project files
cd /var/www/
sudo git clone <your-repo-url> sunx-loyalty
cd sunx-loyalty

# Install dependencies
sudo npm install
cd backend && sudo npm install && cd ..
cd frontend && sudo npm install && cd ..

# Build frontend
cd frontend
sudo npm run build
cd ..
```

#### Step 4: Configure Environment
```bash
sudo nano .env
```

```env
MONGODB_URI=mongodb://localhost:27017/sunx_loyalty
JWT_SECRET=your-very-secure-production-secret-key
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password
REACT_APP_API_URL=https://yourdomain.com/api
```

#### Step 5: Start Services
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Seed database
cd backend
node scripts/seedData.js
cd ..

# Start backend with PM2
pm2 start backend/server.js --name "sunx-backend"

# Serve frontend with Nginx
sudo cp frontend/build/* /var/www/html/
```

#### Step 6: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/sunx-loyalty
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sunx-loyalty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Enable PM2 startup
pm2 startup
pm2 save
```

---

## 🧪 Testing Your Installation

### Basic Tests
1. **Landing Page**: http://localhost:3000
2. **API Health**: http://localhost:5000/health
3. **Admin Login**: http://localhost:3000/admin/login
4. **User Registration**: Create a new account
5. **Dark Mode**: Toggle theme
6. **Mobile View**: Test responsive design

### Demo Credentials
- **Installer**: ahmed.ali@example.com / password123
- **Admin**: admin@sunx.com / admin123

### Verification Checklist
- [ ] Landing page loads with SunX branding
- [ ] Registration creates new accounts
- [ ] Login works with demo credentials
- [ ] Dashboard shows progress tracking
- [ ] Admin panel accessible
- [ ] Dark mode toggle works
- [ ] Mobile responsive design
- [ ] No console errors (F12)

---

## 🔧 Troubleshooting

### Common Issues

#### "Cannot connect to MongoDB"
```bash
# Check MongoDB status
sudo systemctl status mongod    # Linux
brew services list | grep mongo # Mac

# Restart MongoDB
sudo systemctl restart mongod   # Linux
brew services restart mongodb-community # Mac
```

#### "Port already in use"
```bash
# Find process using port
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # Mac/Linux

# Kill process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                   # Mac/Linux
```

#### "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "Docker containers won't start"
```bash
# Check Docker status
docker ps

# Restart Docker Desktop
# Or restart Docker service on Linux
sudo systemctl restart docker
```

---

## 📞 Support

### Getting Help
1. **Check logs** for error messages
2. **Verify all services** are running
3. **Test with demo credentials**
4. **Check network connectivity**
5. **Review environment variables**

### Useful Commands
```bash
# Check running processes
docker ps                    # Docker
pm2 list                    # PM2
netstat -tulpn             # Network ports

# View logs
docker-compose logs        # Docker
pm2 logs                   # PM2
tail -f /var/log/nginx/error.log # Nginx

# Restart services
docker-compose restart     # Docker
pm2 restart all            # PM2
sudo systemctl restart nginx # Nginx
```

---

## 🎉 Success!

If you can access http://localhost:3000 and see the beautiful SunX landing page with orange branding, congratulations! Your SunX Loyalty Program is now running successfully.

**Next Steps:**
1. **Explore** the application features
2. **Test** with demo accounts
3. **Customize** for your needs
4. **Deploy** to production (if needed)

Happy coding! 🌞

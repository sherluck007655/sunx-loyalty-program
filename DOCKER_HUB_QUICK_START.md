# 🐳 SunX Loyalty Program - Docker Hub Quick Start

## 🚀 Super Easy Deployment (2 Steps Only!)

Deploy your complete SunX Loyalty Program to any server in just 2 steps using Docker Hub.

**Your Docker Hub Username:** `sherluck007`
**Your Repositories:**
- `sherluck007/sunx-loyalty-frontend` ✅ (Already created!)
- `sherluck007/sunx-loyalty-backend` ✅ (Already created!)

---

## **Step 1: Build and Push Images (Your Local Machine)**

### **1.1 Your Docker Hub Setup** ✅
✅ **Account Created**: `sherluck007`
✅ **Backend Repository**: `sherluck007/sunx-loyalty-backend`
✅ **Frontend Repository**: `sherluck007/sunx-loyalty-frontend` (You'll need to create this)

### **1.2 Build and Push Images**
```bash
# Navigate to your project directory
cd /path/to/your/sunx-loyalty-project

# Make build script executable
chmod +x build-and-push.sh

# Build and push images with YOUR details
./build-and-push.sh sherluck007 YOUR-SERVER-IP
```

**Example with your username:**
```bash
# If your server IP is 123.45.67.89
./build-and-push.sh sherluck007 123.45.67.89
```

**That's it for Step 1! Your images are now on Docker Hub! 🎉**

---

## **Step 2: Deploy on Server (One Command)**

### **Method A: One-Line Deployment**
```bash
# Connect to your server
ssh root@YOUR-SERVER-IP

# Deploy with one command using YOUR Docker Hub username
curl -sSL https://raw.githubusercontent.com/sherluck007/sunx-loyalty/main/one-command-deploy.sh | bash -s sherluck007
```

### **Method B: Manual Deployment**
```bash
# Connect to your server
ssh root@YOUR-SERVER-IP

# Download deployment script
wget https://raw.githubusercontent.com/sherluck007/sunx-loyalty/main/one-command-deploy.sh
chmod +x one-command-deploy.sh

# Run deployment with YOUR username
./one-command-deploy.sh sherluck007
```

**That's it! Your application is now live! 🎉**

---

## **🎯 What Happens During Deployment**

The deployment script automatically:

✅ **Updates the server**  
✅ **Installs Docker & Docker Compose**  
✅ **Configures firewall** (ports 22, 80, 443, 5000)  
✅ **Creates application directory** (/var/www/sunx-loyalty)  
✅ **Pulls your images** from Docker Hub  
✅ **Starts all services** (MongoDB, Backend, Frontend)  
✅ **Seeds the database** with initial data  
✅ **Creates management scripts**  
✅ **Runs health checks**  

---

## **📊 After Deployment**

### **Access Your Application:**
- **Frontend**: `http://your-server-ip`
- **Backend API**: `http://your-server-ip:5000`
- **Health Check**: `http://your-server-ip:5000/health`

### **Default Admin Login:**
- **Email**: `admin@sunx.com`
- **Password**: `admin123`

### **Management Commands:**
```bash
cd /var/www/sunx-loyalty

./start.sh     # Start services
./stop.sh      # Stop services  
./update.sh    # Update to latest version
./backup.sh    # Create database backup
./logs.sh      # View live logs
```

---

## **🔄 Update Your Application**

### **To Push Updates:**
```bash
# On your local machine (with YOUR details)
./build-and-push.sh sherluck007 YOUR-SERVER-IP

# On your server
cd /var/www/sunx-loyalty
./update.sh
```

---

## **🌐 Example Deployment with YOUR Details**

Let's say your server IP is `123.45.67.89` (replace with your actual server IP):

### **Step 1 (Your Local Machine):**
```bash
./build-and-push.sh sherluck007 123.45.67.89
```

### **Step 2 (Your Server):**
```bash
curl -sSL https://raw.githubusercontent.com/sherluck007/sunx-loyalty/main/one-command-deploy.sh | bash -s sherluck007
```

### **Result:**
- **Frontend**: `http://123.45.67.89`
- **Backend**: `http://123.45.67.89:5000`
- **Admin Login**: `admin@sunx.com` / `admin123`

### **Your Docker Hub Images:**
- **Frontend**: `https://hub.docker.com/r/sherluck007/sunx-loyalty-frontend` (Create this repository)
- **Backend**: `https://hub.docker.com/r/sherluck007/sunx-loyalty-backend` ✅ (Already created!)

### **📸 Your Docker Hub Setup:**
Based on your screenshot, you have:
- ✅ **Docker Hub Account**: `sherluck007`
- ✅ **Backend Repository**: `sherluck007/sunx-loyalty-backend` (Created)
- ⚠️ **Frontend Repository**: `sherluck007/sunx-loyalty-frontend` (Need to create)

**To create the frontend repository:**
1. Go to [Docker Hub](https://hub.docker.com)
2. Click "Create Repository"
3. Name: `sunx-loyalty-frontend`
4. Description: "SunX Loyalty Program Frontend"
5. Set to Public
6. Click "Create"

---

## **🔧 Troubleshooting**

### **If deployment fails:**
```bash
# Check service status
cd /var/www/sunx-loyalty
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Check if images exist on Docker Hub
docker pull your-username/sunx-loyalty-frontend:latest
docker pull your-username/sunx-loyalty-backend:latest
```

### **Common Issues:**

#### **"Image not found" error:**
- Make sure you pushed images to Docker Hub with username `sherluck007`
- Check repository names: `sherluck007/sunx-loyalty-frontend` and `sherluck007/sunx-loyalty-backend`
- Verify you created the frontend repository on Docker Hub

#### **"Permission denied" error:**
- Run deployment as root or with sudo
- Make sure Docker group is configured

#### **Services won't start:**
- Check if ports are already in use: `sudo lsof -i :80,5000,27017`
- Check firewall settings: `sudo ufw status`
- Verify server has enough memory: `free -h`

#### **Check Your Docker Hub Images:**
```bash
# Verify your images exist on Docker Hub
docker pull sherluck007/sunx-loyalty-frontend:latest
docker pull sherluck007/sunx-loyalty-backend:latest
```

---

## **🔒 Security Checklist**

After deployment:

- [ ] Change default admin password
- [ ] Configure SSL certificate: `sudo certbot --nginx`
- [ ] Set up regular backups: `crontab -e` → `0 2 * * * /var/www/sunx-loyalty/backup.sh`
- [ ] Monitor logs regularly: `./logs.sh`
- [ ] Update system regularly: `sudo apt update && sudo apt upgrade`

---

## **📋 Your Project Structure**

**Local Development Structure:**
```
sunx-loyalty-project/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   └── services/          # API services
│   ├── public/
│   ├── package.json
│   └── Dockerfile             # Frontend Docker config
├── backend/                     # Node.js backend
│   ├── routes/                # API routes
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── installer.js
│   │   ├── payment.js
│   │   ├── promotion.js
│   │   └── serial.js
│   ├── models/                # MongoDB models
│   │   ├── Admin.js
│   │   ├── Installer.js
│   │   ├── Payment.js
│   │   ├── Promotion.js
│   │   └── SerialNumber.js
│   ├── middleware/            # Express middleware
│   ├── utils/                 # Utility functions
│   ├── scripts/               # Database scripts
│   ├── server.js              # Main server file
│   ├── package.json
│   └── Dockerfile             # Backend Docker config
├── build-and-push.sh           # Build & push to Docker Hub
├── one-command-deploy.sh       # One-command deployment
└── docker-compose.hub.yml      # Production Docker Compose
```

**Server Structure After Deployment:**
```
/var/www/sunx-loyalty/
├── docker-compose.yml    # Service configuration
├── start.sh             # Start services
├── stop.sh              # Stop services
├── update.sh            # Update application
├── backup.sh            # Create backups
├── logs.sh              # View logs
├── uploads/             # File uploads
├── logs/                # Application logs
└── backups/             # Database backups
```

---

## **🎉 Benefits of Docker Hub Deployment**

✅ **Super Fast**: Deploy in 2-3 minutes  
✅ **No File Uploads**: Everything pulls from Docker Hub  
✅ **Version Control**: Tag and manage different versions  
✅ **Easy Updates**: Just push new image and restart  
✅ **Consistent**: Same environment everywhere  
✅ **Scalable**: Deploy on multiple servers easily  
✅ **Automated**: One command does everything  

---

## **📞 Support**

If you need help:

1. **Check logs**: `./logs.sh`
2. **Verify services**: `docker-compose ps`
3. **Test connectivity**: `curl http://localhost:5000/health`
4. **Check Docker Hub**: Verify your images are uploaded

---

## **🎯 Quick Summary for sherluck007**

### **What You Have:**
- ✅ Docker Hub Account: `sherluck007`
- ✅ Backend Repository: `sherluck007/sunx-loyalty-backend`
- ⚠️ Frontend Repository: Need to create `sherluck007/sunx-loyalty-frontend`

### **What You Need to Do:**

**1. Create Frontend Repository on Docker Hub**
- Go to Docker Hub → Create Repository → Name: `sunx-loyalty-frontend`

**2. Build and Push Images (Your Machine)**
```bash
chmod +x build-and-push.sh
./build-and-push.sh sherluck007 YOUR-SERVER-IP
```

**3. Deploy on Server (One Command)**
```bash
curl -sSL https://raw.githubusercontent.com/sherluck007/sunx-loyalty/main/one-command-deploy.sh | bash -s sherluck007
```

### **Result:**
- **Your App**: `http://YOUR-SERVER-IP`
- **Admin Panel**: `http://YOUR-SERVER-IP` (Login: `admin@sunx.com` / `admin123`)
- **API**: `http://YOUR-SERVER-IP:5000`

### **Your Images on Docker Hub:**
- `docker pull sherluck007/sunx-loyalty-frontend:latest`
- `docker pull sherluck007/sunx-loyalty-backend:latest`

**Your SunX Loyalty Program is now ready for production! 🚀**

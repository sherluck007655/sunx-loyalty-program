# 🐳 SunX Loyalty Program - Docker Installation Guide

This guide will help you run the SunX Loyalty Program using Docker. Docker makes it easy to run the application without installing Node.js, MongoDB, or other dependencies on your computer.

## 📋 Prerequisites

### Step 1: Install Docker Desktop

#### For Windows:
1. **Visit** https://www.docker.com/products/docker-desktop/
2. **Click** "Download for Windows"
3. **Run** the installer (`Docker Desktop Installer.exe`)
4. **Follow** the installation wizard
5. **Restart** your computer when prompted
6. **Open** Docker Desktop from Start Menu
7. **Wait** for Docker to start (you'll see a whale icon in system tray)

#### For Mac:
1. **Visit** https://www.docker.com/products/docker-desktop/
2. **Click** "Download for Mac"
3. **Open** the downloaded `.dmg` file
4. **Drag** Docker to Applications folder
5. **Open** Docker from Applications
6. **Allow** Docker to start

#### For Linux (Ubuntu/Debian):
```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
sudo apt update
sudo apt install docker-ce

# Add your user to docker group
sudo usermod -aG docker $USER

# Restart your session or reboot
```

### Step 2: Verify Docker Installation

Open Command Prompt (Windows) or Terminal (Mac/Linux) and run:

```bash
docker --version
docker-compose --version
```

You should see output like:
```
Docker version 24.0.6, build ed223bc
Docker Compose version v2.21.0
```

## 🚀 Running SunX Loyalty Program with Docker

### Method 1: Using Docker Compose (Recommended)

This method starts all services (Frontend, Backend, Database) with one command.

#### Step 1: Navigate to Project Directory

Open Command Prompt/Terminal and navigate to your project folder:

```bash
# Windows
cd "C:\Users\YourName\Desktop\SunX-Loyalty-Program"

# Mac/Linux
cd ~/Desktop/SunX-Loyalty-Program
```

#### Step 2: Create Environment File

Create a `.env` file in the root directory:

```bash
# Copy the example file
copy .env.example .env     # Windows
cp .env.example .env       # Mac/Linux
```

Edit the `.env` file with these Docker-specific settings:

```env
# MongoDB Configuration (Docker)
MONGODB_URI=mongodb://admin:password123@mongodb:27017/sunx_loyalty?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Admin Configuration
ADMIN_EMAIL=admin@sunx.com
ADMIN_PASSWORD=admin123

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

#### Step 3: Start All Services

Run this single command to start everything:

```bash
docker-compose up --build
```

**What this command does:**
- Downloads required Docker images
- Builds the frontend and backend containers
- Starts MongoDB database
- Starts the backend API server
- Starts the frontend React application
- Sets up networking between all services

#### Step 4: Wait for Startup

You'll see logs from all services. Wait for these messages:

```
sunx-mongodb    | waiting for connections on port 27017
sunx-backend    | Server running on port 5000
sunx-backend    | MongoDB Connected: mongodb
sunx-frontend   | webpack compiled successfully
sunx-frontend   | Local: http://localhost:3000
```

#### Step 5: Access the Application

Open your web browser and visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

#### Step 6: Stop the Application

To stop all services, press `Ctrl+C` in the terminal, then run:

```bash
docker-compose down
```

### Method 2: Individual Docker Commands

If you prefer to run services separately:

#### Step 1: Create Docker Network

```bash
docker network create sunx-network
```

#### Step 2: Start MongoDB

```bash
docker run -d \
  --name sunx-mongodb \
  --network sunx-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=sunx_loyalty \
  mongo:6.0
```

#### Step 3: Build and Start Backend

```bash
# Navigate to backend directory
cd backend

# Build backend image
docker build -t sunx-backend .

# Run backend container
docker run -d \
  --name sunx-backend \
  --network sunx-network \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://admin:password123@sunx-mongodb:27017/sunx_loyalty?authSource=admin \
  -e JWT_SECRET=your-super-secret-jwt-key \
  -e PORT=5000 \
  sunx-backend

# Go back to root directory
cd ..
```

#### Step 4: Build and Start Frontend

```bash
# Navigate to frontend directory
cd frontend

# Build frontend image
docker build -t sunx-frontend .

# Run frontend container
docker run -d \
  --name sunx-frontend \
  --network sunx-network \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:5000/api \
  sunx-frontend

# Go back to root directory
cd ..
```

## 🗄️ Database Setup

### Seed the Database with Sample Data

After all services are running, add sample data:

```bash
# Method 1: Using docker-compose
docker-compose exec backend node scripts/seedData.js

# Method 2: Using individual containers
docker exec sunx-backend node scripts/seedData.js
```

You should see:
```
MongoDB Connected for seeding...
Super admin created: admin@sunx.com
3 promotions created
3 sample installers created
Database seeding completed successfully!
```

## 🧪 Testing the Docker Installation

### Step 1: Verify All Services

Check that all containers are running:

```bash
docker ps
```

You should see 3 containers:
- `sunx-frontend` (port 3000)
- `sunx-backend` (port 5000)
- `sunx-mongodb` (port 27017)

### Step 2: Test the Application

1. **Visit** http://localhost:3000 - Should show SunX landing page
2. **Visit** http://localhost:5000/health - Should show API health status
3. **Test** login with demo credentials:
   - Installer: ahmed.ali@example.com / password123
   - Admin: admin@sunx.com / admin123

### Step 3: Check Logs

View logs from any service:

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f backend
```

## 🔧 Docker Management Commands

### Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up --build

# View container logs
docker logs sunx-backend

# Execute command in running container
docker exec -it sunx-backend bash

# Remove all containers and images (cleanup)
docker system prune -a
```

### Updating the Application

When you make code changes:

```bash
# Rebuild and restart
docker-compose down
docker-compose up --build
```

## 🔍 Troubleshooting Docker Issues

### Issue: "Docker is not running"
**Solution:**
- Start Docker Desktop application
- Wait for Docker to fully start (whale icon in system tray)

### Issue: "Port already in use"
**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :3000    # Windows
lsof -i :3000                   # Mac/Linux

# Stop conflicting services
docker-compose down
```

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check MongoDB logs
docker-compose logs mongodb
```

### Issue: "Build failed"
**Solution:**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up
```

### Issue: "Frontend not loading"
**Solution:**
```bash
# Check frontend logs
docker-compose logs frontend

# Restart frontend service
docker-compose restart frontend

# Rebuild frontend
docker-compose up --build frontend
```

## 📊 Docker Resource Usage

### Monitor Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df

# Clean up unused resources
docker system prune
```

### Performance Tips

1. **Allocate enough resources** to Docker Desktop:
   - Go to Docker Desktop → Settings → Resources
   - Increase Memory to at least 4GB
   - Increase CPU to at least 2 cores

2. **Close unnecessary applications** while running Docker

3. **Use Docker volumes** for persistent data (already configured in docker-compose.yml)

## 🎯 Quick Start Checklist

- [ ] Docker Desktop installed and running
- [ ] Project files downloaded
- [ ] `.env` file created with Docker settings
- [ ] Run `docker-compose up --build`
- [ ] Wait for all services to start
- [ ] Seed database with sample data
- [ ] Test application at http://localhost:3000
- [ ] Verify API at http://localhost:5000/health
- [ ] Test login with demo credentials

## 🆘 Getting Help

If you encounter issues:

1. **Check Docker Desktop** is running
2. **View logs** with `docker-compose logs`
3. **Restart services** with `docker-compose restart`
4. **Clean rebuild** with `docker-compose down && docker-compose up --build`
5. **Check ports** are not in use by other applications

**Common URLs:**
- Application: http://localhost:3000
- API: http://localhost:5000
- Health Check: http://localhost:5000/health
- Admin Panel: http://localhost:3000/admin/login

That's it! Your SunX Loyalty Program is now running in Docker containers! 🎉

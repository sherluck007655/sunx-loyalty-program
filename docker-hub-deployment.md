# SunX Loyalty Program - Docker Hub Deployment

## 🐳 Deploy from Docker Hub (Easiest Method)

This guide shows how to create Docker images, push them to Docker Hub, and deploy directly on your server using just URLs.

---

## **Step 1: Create Docker Hub Account**

1. Go to [Docker Hub](https://hub.docker.com)
2. Create a free account
3. Create two repositories:
   - `sunx-loyalty-frontend`
   - `sunx-loyalty-backend`

---

## **Step 2: Build and Push Images (Local Machine)**

### **2.1 Login to Docker Hub**
```bash
docker login
# Enter your Docker Hub username and password
```

### **2.2 Build and Push Backend Image**
```bash
# Navigate to your project directory
cd /path/to/your/sunx-loyalty-project

# Build backend image
docker build -t yourusername/sunx-loyalty-backend:latest ./backend

# Push to Docker Hub
docker push yourusername/sunx-loyalty-backend:latest
```

### **2.3 Build and Push Frontend Image**
```bash
# Build frontend image with production settings
docker build -f frontend/Dockerfile.prod -t yourusername/sunx-loyalty-frontend:latest ./frontend --build-arg REACT_APP_API_URL=http://YOUR_SERVER_IP:5000/api

# Push to Docker Hub
docker push yourusername/sunx-loyalty-frontend:latest
```

---

## **Step 3: Deploy on Server (Super Easy!)**

### **3.1 Connect to Your Server**
```bash
ssh root@YOUR_SERVER_IP
```

### **3.2 Create Deployment Directory**
```bash
mkdir -p /var/www/sunx-loyalty
cd /var/www/sunx-loyalty
```

### **3.3 Create Docker Compose File**
```bash
nano docker-compose.yml
```

Paste this content (replace `yourusername` with your Docker Hub username):

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: sunx-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure-mongo-password
      MONGO_INITDB_DATABASE: sunx_loyalty
    volumes:
      - mongodb_data:/data/db
    networks:
      - sunx-network
    ports:
      - "27017:27017"

  # Backend API (from Docker Hub)
  backend:
    image: yourusername/sunx-loyalty-backend:latest
    container_name: sunx-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:secure-mongo-password@mongodb:27017/sunx_loyalty?authSource=admin
      - JWT_SECRET=your-super-secure-jwt-key-change-this
      - JWT_EXPIRE=7d
      - PORT=5000
      - ADMIN_EMAIL=admin@yourdomain.com
      - ADMIN_PASSWORD=your-secure-password
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - sunx-network

  # Frontend (from Docker Hub)
  frontend:
    image: yourusername/sunx-loyalty-frontend:latest
    container_name: sunx-frontend
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

### **3.4 Start the Application**
```bash
# Pull images and start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### **3.5 Seed Database**
```bash
# Wait for services to start (30 seconds)
sleep 30

# Seed the database
docker-compose exec backend node scripts/seedData.js
```

---

## **Step 4: One-Command Server Setup + Deploy**

I'll create a single script that does everything:

### **4.1 Create All-in-One Deploy Script**
```bash
# On your server, create this script:
nano quick-deploy.sh
```

Paste this content:

```bash
#!/bin/bash

# SunX Loyalty Program - One-Command Deployment from Docker Hub
# Usage: ./quick-deploy.sh yourusername

set -e

DOCKER_USERNAME=${1:-"yourusername"}
SERVER_IP=$(curl -s ifconfig.me)

echo "🌞 SunX Loyalty Program - Quick Deploy from Docker Hub"
echo "====================================================="
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "Server IP: $SERVER_IP"
echo ""

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "🐙 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
sudo ufw --force enable

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/sunx-loyalty
cd /var/www/sunx-loyalty

# Create docker-compose.yml
echo "📝 Creating Docker Compose configuration..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: sunx-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure-mongo-password
      MONGO_INITDB_DATABASE: sunx_loyalty
    volumes:
      - mongodb_data:/data/db
    networks:
      - sunx-network

  backend:
    image: ${DOCKER_USERNAME}/sunx-loyalty-backend:latest
    container_name: sunx-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:secure-mongo-password@mongodb:27017/sunx_loyalty?authSource=admin
      - JWT_SECRET=sunx-super-secure-jwt-key-$(date +%s)
      - JWT_EXPIRE=7d
      - PORT=5000
      - ADMIN_EMAIL=admin@sunx.com
      - ADMIN_PASSWORD=admin123
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - sunx-network

  frontend:
    image: ${DOCKER_USERNAME}/sunx-loyalty-frontend:latest
    container_name: sunx-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - sunx-network

volumes:
  mongodb_data:

networks:
  sunx-network:
    driver: bridge
EOF

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 45

# Seed database
echo "🌱 Seeding database..."
docker-compose exec -T backend node scripts/seedData.js || echo "Database already seeded"

# Show status
echo ""
echo "✅ Deployment completed!"
echo "========================"
echo "🌐 Frontend: http://$SERVER_IP"
echo "🔧 Backend:  http://$SERVER_IP:5000"
echo "❤️  Health:  http://$SERVER_IP:5000/health"
echo ""
echo "🔐 Default Admin Login:"
echo "📧 Email: admin@sunx.com"
echo "🔑 Password: admin123"
echo ""
echo "📊 Useful commands:"
echo "docker-compose ps          # Check status"
echo "docker-compose logs -f     # View logs"
echo "docker-compose restart     # Restart services"
echo "docker-compose down        # Stop services"
EOF

# Make executable
chmod +x quick-deploy.sh
```

---

## **Step 5: Super Simple Deployment Process**

### **For You (One Time Setup):**
1. **Build and push images** to Docker Hub (from your local machine)
2. **Share the Docker Hub username** with anyone who wants to deploy

### **For Server Deployment (Anyone can do this):**
```bash
# Connect to server
ssh root@SERVER_IP

# Download and run deployment script
curl -sSL https://raw.githubusercontent.com/yourusername/sunx-loyalty/main/quick-deploy.sh -o quick-deploy.sh
chmod +x quick-deploy.sh

# Deploy with your Docker Hub username
./quick-deploy.sh yourusername
```

**That's it! The application will be live in 2-3 minutes! 🎉**

---

## **Step 6: Update Application**

### **To Update the Application:**
```bash
# On your local machine - build and push new version
docker build -t yourusername/sunx-loyalty-backend:latest ./backend
docker push yourusername/sunx-loyalty-backend:latest

docker build -f frontend/Dockerfile.prod -t yourusername/sunx-loyalty-frontend:latest ./frontend
docker push yourusername/sunx-loyalty-frontend:latest

# On server - pull and restart
cd /var/www/sunx-loyalty
docker-compose pull
docker-compose up -d
```

---

## **Benefits of Docker Hub Deployment:**

✅ **Super Easy**: One command deployment  
✅ **No File Uploads**: Everything pulls from Docker Hub  
✅ **Version Control**: Tag different versions  
✅ **Fast Updates**: Just push new image and restart  
✅ **Consistent**: Same environment everywhere  
✅ **Scalable**: Deploy on multiple servers easily  

---

## **Example Docker Hub URLs:**

After pushing, your images will be available at:
- `docker pull yourusername/sunx-loyalty-frontend:latest`
- `docker pull yourusername/sunx-loyalty-backend:latest`

Anyone can deploy your application using just these URLs! 🚀

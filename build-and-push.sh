#!/bin/bash

# SunX Loyalty Program - Build and Push to Docker Hub
# Usage: ./build-and-push.sh [docker-username] [server-ip]
# Example: ./build-and-push.sh sherluck007 123.45.67.89

set -e

# Configuration
DOCKER_USERNAME=${1:-"sherluck007"}
SERVER_IP=${2:-"YOUR_SERVER_IP"}
VERSION=${3:-"latest"}

echo "🌞 SunX Loyalty Program - Build and Push to Docker Hub"
echo "====================================================="
echo "Docker Username: $DOCKER_USERNAME"
echo "Server IP: $SERVER_IP"
echo "Version: $VERSION"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    print_warning "Not logged in to Docker Hub. Please login first:"
    docker login
fi

# Validate inputs
if [ "$DOCKER_USERNAME" = "yourusername" ]; then
    print_error "Please provide your actual Docker Hub username"
    echo "Usage: ./build-and-push.sh your-docker-username your-server-ip"
    exit 1
fi

if [ "$SERVER_IP" = "YOUR_SERVER_IP" ]; then
    print_warning "Server IP not provided. Using placeholder. You can update this later."
fi

# Step 1: Build Backend Image
print_status "Building backend image..."
if docker build -t $DOCKER_USERNAME/sunx-loyalty-backend:$VERSION ./backend; then
    print_success "Backend image built successfully!"
else
    print_error "Failed to build backend image"
    exit 1
fi

# Step 2: Build Frontend Image
print_status "Building frontend image..."
if docker build -f frontend/Dockerfile.prod \
    -t $DOCKER_USERNAME/sunx-loyalty-frontend:$VERSION \
    --build-arg REACT_APP_API_URL=http://$SERVER_IP:5000/api \
    ./frontend; then
    print_success "Frontend image built successfully!"
else
    print_error "Failed to build frontend image"
    exit 1
fi

# Step 3: Push Backend Image
print_status "Pushing backend image to Docker Hub..."
if docker push $DOCKER_USERNAME/sunx-loyalty-backend:$VERSION; then
    print_success "Backend image pushed successfully!"
else
    print_error "Failed to push backend image"
    exit 1
fi

# Step 4: Push Frontend Image
print_status "Pushing frontend image to Docker Hub..."
if docker push $DOCKER_USERNAME/sunx-loyalty-frontend:$VERSION; then
    print_success "Frontend image pushed successfully!"
else
    print_error "Failed to push frontend image"
    exit 1
fi

# Step 5: Create deployment files
print_status "Creating deployment files..."

# Create docker-compose.yml for server deployment
cat > docker-compose.hub.yml << EOF
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: sunx-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure-mongo-password-change-this
      MONGO_INITDB_DATABASE: sunx_loyalty
    volumes:
      - mongodb_data:/data/db
    networks:
      - sunx-network
    ports:
      - "27017:27017"

  # Backend API (from Docker Hub)
  backend:
    image: $DOCKER_USERNAME/sunx-loyalty-backend:$VERSION
    container_name: sunx-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:secure-mongo-password-change-this@mongodb:27017/sunx_loyalty?authSource=admin
      - JWT_SECRET=sunx-super-secure-jwt-key-change-this-in-production
      - JWT_EXPIRE=7d
      - PORT=5000
      - ADMIN_EMAIL=admin@sunx.com
      - ADMIN_PASSWORD=admin123
      - CORS_ORIGIN=http://$SERVER_IP,https://yourdomain.com
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - sunx-network
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (from Docker Hub)
  frontend:
    image: $DOCKER_USERNAME/sunx-loyalty-frontend:$VERSION
    container_name: sunx-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - sunx-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mongodb_data:
    driver: local

networks:
  sunx-network:
    driver: bridge
EOF

# Create one-command deployment script
cat > quick-deploy-from-hub.sh << 'EOF'
#!/bin/bash

# SunX Loyalty Program - One-Command Deployment from Docker Hub
# Usage: ./quick-deploy-from-hub.sh [docker-username]

set -e

DOCKER_USERNAME=${1:-"DOCKER_USERNAME_PLACEHOLDER"}
SERVER_IP=$(curl -s ifconfig.me || echo "localhost")

echo "🌞 SunX Loyalty Program - Quick Deploy from Docker Hub"
echo "====================================================="
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "Server IP: $SERVER_IP"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }

# Update system
print_status "Updating system..."
sudo apt update -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp
sudo ufw --force enable

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /var/www/sunx-loyalty
sudo chown -R $USER:$USER /var/www/sunx-loyalty
cd /var/www/sunx-loyalty

# Create necessary directories
mkdir -p uploads logs

# Download docker-compose file
print_status "Downloading Docker Compose configuration..."
curl -sSL "https://raw.githubusercontent.com/GITHUB_USERNAME_PLACEHOLDER/sunx-loyalty/main/docker-compose.hub.yml" -o docker-compose.yml || {
    # Fallback: create docker-compose.yml locally
    cat > docker-compose.yml << COMPOSE_EOF
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
    image: $DOCKER_USERNAME/sunx-loyalty-backend:latest
    container_name: sunx-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:secure-mongo-password@mongodb:27017/sunx_loyalty?authSource=admin
      - JWT_SECRET=sunx-jwt-secret-$(date +%s)
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
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
  frontend:
    image: $DOCKER_USERNAME/sunx-loyalty-frontend:latest
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
COMPOSE_EOF
}

# Pull and start services
print_status "Pulling images and starting services..."
docker-compose pull
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 45

# Seed essential data only (preserves existing data)
print_status "Seeding essential data (preserving existing data)..."
docker-compose exec -T backend node scripts/seedEssentialData.js || print_warning "Essential data seeding failed or already completed"

# Show final status
echo ""
echo "=============================================="
print_success "🎉 Deployment completed successfully!"
echo "=============================================="
echo ""
echo "📊 Your SunX Loyalty Program is now live:"
echo "  🌐 Frontend:     http://$SERVER_IP"
echo "  🔧 Backend API:  http://$SERVER_IP:5000"
echo "  ❤️  Health Check: http://$SERVER_IP:5000/health"
echo ""
echo "🔐 Default Admin Login:"
echo "  📧 Email:    admin@sunx.com"
echo "  🔑 Password: admin123"
echo ""
echo "📋 Management Commands:"
echo "  docker-compose ps              # Check status"
echo "  docker-compose logs -f         # View logs"
echo "  docker-compose restart         # Restart all"
echo "  docker-compose pull && docker-compose up -d  # Update"
echo ""
print_warning "⚠️  Remember to change default passwords in production!"
EOF

# Replace placeholders in the deployment script
sed -i "s/DOCKER_USERNAME_PLACEHOLDER/$DOCKER_USERNAME/g" quick-deploy-from-hub.sh
sed -i "s/GITHUB_USERNAME_PLACEHOLDER/$DOCKER_USERNAME/g" quick-deploy-from-hub.sh

chmod +x quick-deploy-from-hub.sh

print_success "Deployment files created!"

# Step 6: Show completion message
echo ""
echo "=============================================="
print_success "🎉 Build and Push completed successfully!"
echo "=============================================="
echo ""
echo "📦 Docker Images Created:"
echo "  🔧 Backend:  $DOCKER_USERNAME/sunx-loyalty-backend:$VERSION"
echo "  🌐 Frontend: $DOCKER_USERNAME/sunx-loyalty-frontend:$VERSION"
echo ""
echo "🚀 To deploy on any server, run:"
echo "  curl -sSL https://raw.githubusercontent.com/$DOCKER_USERNAME/sunx-loyalty/main/quick-deploy-from-hub.sh | bash -s $DOCKER_USERNAME"
echo ""
echo "📋 Or manually:"
echo "  1. Copy 'quick-deploy-from-hub.sh' to your server"
echo "  2. Run: ./quick-deploy-from-hub.sh $DOCKER_USERNAME"
echo ""
echo "🔄 To update application:"
echo "  1. Run this script again to build new images"
echo "  2. On server: docker-compose pull && docker-compose up -d"
echo ""
print_success "Your application is ready for deployment! 🎉"

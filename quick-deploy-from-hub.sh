#!/bin/bash

# SunX Loyalty Program - One-Command Deployment from Docker Hub
# Usage: ./quick-deploy-from-hub.sh [docker-username]

set -e

DOCKER_USERNAME=${1:-"sherluck007"}
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
curl -sSL "https://raw.githubusercontent.com/sherluck007/sunx-loyalty/main/docker-compose.hub.yml" -o docker-compose.yml || {
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

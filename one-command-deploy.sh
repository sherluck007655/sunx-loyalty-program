#!/bin/bash

# SunX Loyalty Program - One Command Deployment from Docker Hub
# Usage: curl -sSL https://raw.githubusercontent.com/sherluck007/sunx-loyalty/main/one-command-deploy.sh | bash -s sherluck007

set -e

DOCKER_USERNAME=${1:-""}
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "localhost")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🌞 SunX Loyalty Program - One Command Deployment"
echo "==============================================="
echo ""

# Validate Docker username
if [ -z "$DOCKER_USERNAME" ]; then
    print_error "Docker Hub username is required!"
    echo ""
    echo "Usage examples:"
    echo "  curl -sSL https://your-url/one-command-deploy.sh | bash -s your-docker-username"
    echo "  ./one-command-deploy.sh your-docker-username"
    echo ""
    exit 1
fi

echo "🐳 Docker Hub Username: $DOCKER_USERNAME"
echo "🌐 Server IP: $SERVER_IP"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is okay for initial setup."
    SUDO=""
else
    SUDO="sudo"
fi

# Step 1: Update system
print_status "Updating system packages..."
$SUDO apt update -y

# Step 2: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    $SUDO sh get-docker.sh
    $SUDO usermod -aG docker $USER
    rm -f get-docker.sh
    print_success "Docker installed successfully!"
else
    print_success "Docker is already installed!"
fi

# Step 3: Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    $SUDO curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    $SUDO chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully!"
else
    print_success "Docker Compose is already installed!"
fi

# Step 4: Start Docker service
print_status "Starting Docker service..."
$SUDO systemctl start docker
$SUDO systemctl enable docker

# Step 5: Configure firewall
print_status "Configuring firewall..."
$SUDO ufw allow 22/tcp   # SSH
$SUDO ufw allow 80/tcp   # HTTP
$SUDO ufw allow 443/tcp  # HTTPS
$SUDO ufw allow 5000/tcp # Backend API
$SUDO ufw --force enable
print_success "Firewall configured!"

# Step 6: Create application directory
print_status "Setting up application directory..."
$SUDO mkdir -p /var/www/sunx-loyalty
$SUDO chown -R $USER:$USER /var/www/sunx-loyalty 2>/dev/null || true
cd /var/www/sunx-loyalty

# Create necessary directories
mkdir -p uploads logs backups

# Step 7: Create Docker Compose configuration
print_status "Creating Docker Compose configuration..."
cat > docker-compose.yml << EOF
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: sunx-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: sunx-mongo-password-$(date +%s | tail -c 6)
      MONGO_INITDB_DATABASE: sunx_loyalty
    volumes:
      - mongodb_data:/data/db
    networks:
      - sunx-network
    ports:
      - "127.0.0.1:27017:27017"  # Only allow local connections

  # Backend API (from Docker Hub)
  backend:
    image: $DOCKER_USERNAME/sunx-loyalty-backend:latest
    container_name: sunx-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:sunx-mongo-password-$(date +%s | tail -c 6)@mongodb:27017/sunx_loyalty?authSource=admin
      - JWT_SECRET=sunx-jwt-secret-$(openssl rand -hex 32)
      - JWT_EXPIRE=7d
      - PORT=5000
      - ADMIN_EMAIL=admin@sunx.com
      - ADMIN_PASSWORD=admin123
      - CORS_ORIGIN=http://$SERVER_IP,http://localhost
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
      start_period: 40s

  # Frontend (from Docker Hub)
  frontend:
    image: $DOCKER_USERNAME/sunx-loyalty-frontend:latest
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
      start_period: 40s

volumes:
  mongodb_data:
    driver: local

networks:
  sunx-network:
    driver: bridge
EOF

# Step 8: Create management scripts
print_status "Creating management scripts..."

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting SunX Loyalty Program..."
docker-compose up -d
echo "✅ Services started!"
echo "🌐 Frontend: http://$(curl -s ifconfig.me)"
echo "🔧 Backend: http://$(curl -s ifconfig.me):5000"
EOF

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping SunX Loyalty Program..."
docker-compose down
echo "✅ Services stopped!"
EOF

# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating SunX Loyalty Program..."
docker-compose pull
docker-compose up -d
echo "✅ Update completed!"
EOF

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
echo "💾 Creating backup..."
mkdir -p $BACKUP_DIR
docker-compose exec -T mongodb mongodump --archive > $BACKUP_DIR/mongodb_$DATE.archive
echo "✅ Backup created: $BACKUP_DIR/mongodb_$DATE.archive"
EOF

# Create logs script
cat > logs.sh << 'EOF'
#!/bin/bash
echo "📝 Showing logs (Press Ctrl+C to exit)..."
docker-compose logs -f
EOF

# Make scripts executable
chmod +x start.sh stop.sh update.sh backup.sh logs.sh

# Step 9: Pull images and start services
print_status "Pulling Docker images..."
docker-compose pull

print_status "Starting services..."
docker-compose up -d

# Step 10: Wait for services to be ready
print_status "Waiting for services to start..."
echo "This may take 1-2 minutes for first-time setup..."

# Wait for backend to be healthy
for i in {1..60}; do
    if curl -f http://localhost:5000/health &>/dev/null; then
        print_success "Backend is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        print_warning "Backend health check timeout, but continuing..."
        break
    fi
    sleep 2
done

# Wait a bit more for database
sleep 15

# Step 11: Seed essential data only (preserves existing data)
print_status "Seeding essential data (preserving existing data)..."
if docker-compose exec -T backend node scripts/seedEssentialData.js 2>/dev/null; then
    print_success "Essential data seeded successfully - existing data preserved!"
else
    print_warning "Essential data seeding failed or data already exists"
fi

# Step 12: Final health checks
print_status "Running final health checks..."

# Check services
BACKEND_STATUS="❌"
FRONTEND_STATUS="❌"

if curl -f http://localhost:5000/health &>/dev/null; then
    BACKEND_STATUS="✅"
fi

if curl -f http://localhost &>/dev/null; then
    FRONTEND_STATUS="✅"
fi

# Step 13: Show completion message
echo ""
echo "=============================================="
print_success "🎉 Deployment completed successfully!"
echo "=============================================="
echo ""
echo "📊 Service Status:"
echo "  🔧 Backend:  $BACKEND_STATUS http://$SERVER_IP:5000"
echo "  🌐 Frontend: $FRONTEND_STATUS http://$SERVER_IP"
echo "  ❤️  Health:  http://$SERVER_IP:5000/health"
echo ""
echo "🔐 Default Admin Login:"
echo "  📧 Email:    admin@sunx.com"
echo "  🔑 Password: admin123"
echo ""
echo "📋 Management Commands (in /var/www/sunx-loyalty):"
echo "  ./start.sh     # Start services"
echo "  ./stop.sh      # Stop services"
echo "  ./update.sh    # Update to latest version"
echo "  ./backup.sh    # Create database backup"
echo "  ./logs.sh      # View live logs"
echo ""
echo "🔧 Docker Commands:"
echo "  docker-compose ps              # Check status"
echo "  docker-compose logs -f         # View logs"
echo "  docker-compose restart         # Restart services"
echo "  docker-compose down            # Stop all services"
echo ""
echo "📁 Important Directories:"
echo "  /var/www/sunx-loyalty/uploads  # File uploads"
echo "  /var/www/sunx-loyalty/logs     # Application logs"
echo "  /var/www/sunx-loyalty/backups  # Database backups"
echo ""
print_warning "⚠️  Security Reminders:"
echo "  • Change default admin password after first login"
echo "  • Configure SSL certificate for HTTPS"
echo "  • Set up regular backups (./backup.sh)"
echo "  • Monitor logs regularly (./logs.sh)"
echo ""
print_success "🚀 Your SunX Loyalty Program is now live and ready to use!"

# Show final service status
echo ""
echo "📊 Current Service Status:"
docker-compose ps

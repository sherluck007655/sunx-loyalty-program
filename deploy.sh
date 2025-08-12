#!/bin/bash

# SunX Loyalty Program - Production Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🌞 SunX Loyalty Program - Production Deployment"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root. Consider using a non-root user with sudo privileges."
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if production compose file exists
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found. Please create it first."
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production not found. Please create it first."
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Step 2: Clean up old images and containers (optional)
read -p "Do you want to clean up old Docker images and containers? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Cleaning up old Docker images and containers..."
    docker system prune -f
    docker volume prune -f
fi

# Step 3: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p ./backend/uploads
mkdir -p ./backend/logs
mkdir -p ./frontend/build

# Step 4: Set proper permissions
print_status "Setting proper permissions..."
chmod -R 755 ./backend/uploads
chmod -R 755 ./backend/logs

# Step 5: Copy environment file
print_status "Setting up environment configuration..."
cp .env.production .env

# Step 6: Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Step 7: Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Step 8: Check if services are running
print_status "Checking service status..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "Services are running!"
else
    print_error "Some services failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Step 9: Wait for database to be ready
print_status "Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose -f docker-compose.prod.yml exec -T mongodb mongo --eval "db.adminCommand('ismaster')" &> /dev/null; then
        print_success "Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start within 5 minutes"
        exit 1
    fi
    sleep 10
done

# Step 10: Seed database
print_status "Seeding database with initial data..."
if docker-compose -f docker-compose.prod.yml exec -T backend node scripts/seedData.js; then
    print_success "Database seeded successfully!"
else
    print_warning "Database seeding failed or data already exists"
fi

# Step 11: Run health checks
print_status "Running health checks..."

# Check backend health
if curl -f http://localhost:5000/health &> /dev/null; then
    print_success "Backend health check passed!"
else
    print_warning "Backend health check failed"
fi

# Check frontend
if curl -f http://localhost &> /dev/null; then
    print_success "Frontend health check passed!"
else
    print_warning "Frontend health check failed"
fi

# Step 12: Display service information
echo ""
echo "=============================================="
print_success "🎉 Deployment completed successfully!"
echo "=============================================="
echo ""
echo "📊 Service Information:"
echo "  🌐 Frontend:     http://$(curl -s ifconfig.me || echo 'your-server-ip')"
echo "  🔧 Backend API:  http://$(curl -s ifconfig.me || echo 'your-server-ip'):5000"
echo "  ❤️  Health Check: http://$(curl -s ifconfig.me || echo 'your-server-ip'):5000/health"
echo ""
echo "📋 Useful Commands:"
echo "  📊 Check status:  docker-compose -f docker-compose.prod.yml ps"
echo "  📝 View logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "  🔄 Restart:       docker-compose -f docker-compose.prod.yml restart"
echo "  🛑 Stop:          docker-compose -f docker-compose.prod.yml down"
echo ""
echo "🔐 Default Admin Credentials:"
echo "  📧 Email:    admin@yourdomain.com (change in .env.production)"
echo "  🔑 Password: your-secure-admin-password (change in .env.production)"
echo ""
print_warning "⚠️  Remember to:"
echo "  1. Change default passwords in .env.production"
echo "  2. Configure your domain name"
echo "  3. Set up SSL certificates"
echo "  4. Configure firewall rules"
echo "  5. Set up regular backups"
echo ""
print_success "🚀 Your SunX Loyalty Program is now live!"

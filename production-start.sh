#!/bin/bash

# SunX Loyalty Program - Production Start Script
# This script starts the application in production mode without data cleaning

echo "🌞 SunX Loyalty Program - Production Startup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads logs backups data/mongodb

# Set proper permissions
chmod 755 uploads logs backups
chmod 700 data/mongodb

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose -f docker-compose.production.yml down

# Pull latest images
print_status "Pulling latest images..."
docker-compose -f docker-compose.production.yml pull

# Start services
print_status "Starting production services..."
docker-compose -f docker-compose.production.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check if backend is healthy
print_status "Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:5000/health &>/dev/null; then
        print_success "Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend health check timeout, but continuing..."
        break
    fi
    sleep 2
done

# Check if frontend is accessible
print_status "Checking frontend accessibility..."
for i in {1..15}; do
    if curl -f http://localhost:3000 &>/dev/null; then
        print_success "Frontend is accessible!"
        break
    fi
    if [ $i -eq 15 ]; then
        print_warning "Frontend accessibility check timeout, but continuing..."
        break
    fi
    sleep 2
done

# Seed only essential data (admin account) without cleaning existing data
print_status "Ensuring essential data exists (preserving all existing data)..."
if docker-compose -f docker-compose.production.yml exec -T backend npm run db:seed-essential 2>/dev/null; then
    print_success "Essential data verified - all existing data preserved!"
else
    print_warning "Essential data seeding failed or admin already exists"
fi

# Show status
print_status "Checking container status..."
docker-compose -f docker-compose.production.yml ps

# Run data integrity check
print_status "Running data integrity check..."
if docker-compose -f docker-compose.production.yml exec -T backend npm run db:check 2>/dev/null; then
    print_success "Data integrity check completed!"
else
    print_warning "Data integrity check failed"
fi

echo ""
echo "=============================================="
print_success "🎉 Production deployment completed!"
echo "=============================================="
echo ""
print_success "🌐 Your SunX Loyalty Program is now running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
print_success "🔑 Default Admin Credentials:"
echo "   Email: admin@sunx.com"
echo "   Password: admin123"
echo ""
print_success "📋 Management Commands:"
echo "   Check Status: docker-compose -f docker-compose.production.yml ps"
echo "   View Logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   Stop Services: docker-compose -f docker-compose.production.yml down"
echo "   Data Check: docker-compose -f docker-compose.production.yml exec backend npm run db:check"
echo ""
print_warning "⚠️  IMPORTANT: This production setup preserves all existing data!"
echo "   No data cleaning or sample data insertion occurs."
echo ""

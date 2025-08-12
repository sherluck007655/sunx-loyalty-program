#!/bin/bash

# Loyalty Program VPS Deployment Script
# This script safely updates your application while preserving SSL certificates

echo "🚀 Starting Loyalty Program VPS Deployment..."

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

# Step 1: Backup SSL certificates
print_status "📋 Backing up SSL certificates..."
mkdir -p /backup/ssl-$(date +%Y%m%d-%H%M%S)
if [ -d "/etc/letsencrypt" ]; then
    cp -r /etc/letsencrypt /backup/ssl-$(date +%Y%m%d-%H%M%S)/
    print_success "SSL certificates backed up successfully!"
else
    print_warning "No SSL certificates found at /etc/letsencrypt"
fi

# Step 2: Stop existing containers
print_status "🛑 Stopping existing containers..."
if [ -f "docker-compose.yml" ]; then
    docker-compose down
elif [ -f "docker-compose.vps.yml" ]; then
    docker-compose -f docker-compose.vps.yml down
else
    print_warning "No docker-compose file found, stopping all containers manually..."
    docker stop $(docker ps -q) 2>/dev/null || true
fi

# Step 3: Remove old containers (but keep volumes)
print_status "🗑️ Cleaning up old containers..."
docker container prune -f
docker image prune -f

# Step 4: Pull latest images from Docker Hub
print_status "📦 Pulling latest images from Docker Hub..."
docker pull sherluck007/sunx-loyalty-frontend:latest
docker pull sherluck007/sunx-loyalty-backend:latest
docker pull mongo:latest

# Step 5: Start new containers
print_status "🚀 Starting new containers..."
if [ -f "docker-compose.vps.yml" ]; then
    docker-compose -f docker-compose.vps.yml up -d
else
    print_error "docker-compose.vps.yml not found!"
    exit 1
fi

# Step 6: Wait for services to start
print_status "⏳ Waiting for services to start..."
sleep 15

# Step 7: Check container status
print_status "🔍 Checking container status..."
docker-compose -f docker-compose.vps.yml ps

# Step 8: Test the application
print_status "🧪 Testing application..."
if curl -f -s https://loyalty.sunxpro.com > /dev/null; then
    print_success "✅ Application is running successfully!"
    print_success "🌐 Visit: https://loyalty.sunxpro.com"
else
    print_warning "⚠️ Application might still be starting up..."
    print_status "Check logs with: docker-compose -f docker-compose.vps.yml logs"
fi

# Step 9: Show useful commands
echo ""
print_status "📝 Useful commands:"
echo "  View logs: docker-compose -f docker-compose.vps.yml logs -f"
echo "  Restart:   docker-compose -f docker-compose.vps.yml restart"
echo "  Stop:      docker-compose -f docker-compose.vps.yml down"
echo "  Status:    docker-compose -f docker-compose.vps.yml ps"

print_success "🎉 Deployment completed!"

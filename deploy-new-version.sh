#!/bin/bash

# SunX Loyalty Program - VPS Deployment Script
# This script deploys the latest version from Docker Hub

echo "🚀 Starting SunX Loyalty Program deployment..."

# Configuration
COMPOSE_FILE="docker-compose.hub.yml"
BACKUP_URL="https://loyalty.sunxpv.com/api/admin/backup"

# Function to check if service is healthy
check_health() {
    echo "⏳ Checking application health..."
    for i in {1..30}; do
        if curl -f https://loyalty.sunxpv.com/health > /dev/null 2>&1; then
            echo "✅ Application is healthy!"
            return 0
        fi
        echo "⏳ Waiting for application to start... ($i/30)"
        sleep 10
    done
    echo "❌ Health check failed!"
    return 1
}

# Step 1: Create backup using app's built-in feature
echo "📦 Creating backup..."
curl -X POST "$BACKUP_URL" -H "Content-Type: application/json" || echo "⚠️ Backup failed, continuing anyway..."

# Step 2: Pull latest images
echo "📥 Pulling latest Docker images..."
docker pull sherluck007/sunx-loyalty-frontend:latest
docker pull sherluck007/sunx-loyalty-backend:latest

# Step 3: Deploy with zero downtime
echo "🔄 Deploying new version..."
docker-compose -f $COMPOSE_FILE up -d

# Step 4: Health check
if check_health; then
    echo "🎉 Deployment successful!"
    echo "Frontend: https://loyalty.sunxpv.com"
    echo "Backend API: https://loyalty.sunxpv.com/api"
    echo "Health: https://loyalty.sunxpv.com/health"
else
    echo "❌ Deployment failed - check logs:"
    docker-compose -f $COMPOSE_FILE logs --tail=50
    exit 1
fi

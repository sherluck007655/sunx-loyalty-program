#!/bin/bash

# Safe Deployment Script for Loyalty Program
# This script performs zero-downtime deployment with automatic backup and rollback

set -e  # Exit on any error

# Configuration
DOCKER_IMAGE="${DOCKER_IMAGE:-sherluck007655/sunx-loyalty-program}"
TAG="${TAG:-latest}"
CONTAINER_NAME="loyalty-program"
BACKUP_CONTAINER_NAME="loyalty-program-backup"
NETWORK_NAME="loyalty-network"
MONGO_CONTAINER="loyalty-mongo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --tag TAG        Docker image tag (default: latest)"
    echo "  -s, --skip-backup    Skip database backup"
    echo "  -f, --force          Force deployment without confirmation"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Deploy latest with backup"
    echo "  $0 -t staging        # Deploy staging tag"
    echo "  $0 -s -f             # Deploy without backup and confirmation"
    exit 1
}

# Function to check prerequisites
check_prerequisites() {
    log "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running${NC}"
        exit 1
    fi
    
    # Check if MongoDB container is running
    if ! docker ps | grep -q "$MONGO_CONTAINER"; then
        echo -e "${RED}❌ MongoDB container is not running${NC}"
        exit 1
    fi
    
    log "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to pull new image
pull_image() {
    local image="$DOCKER_IMAGE:$TAG"
    log "${BLUE}📥 Pulling new image: $image${NC}"
    
    if docker pull "$image"; then
        log "${GREEN}✅ Image pulled successfully${NC}"
    else
        echo -e "${RED}❌ Failed to pull image${NC}"
        exit 1
    fi
}

# Function to backup database
backup_database() {
    log "${BLUE}💾 Creating database backup...${NC}"
    
    # Run backup script in MongoDB container
    if docker exec "$MONGO_CONTAINER" bash -c "
        mkdir -p /var/backups/loyalty-program
        mongodump --db loyalty_program --out /var/backups/loyalty-program/pre_deploy_$(date +%Y%m%d_%H%M%S)
    "; then
        log "${GREEN}✅ Database backup completed${NC}"
    else
        echo -e "${RED}❌ Database backup failed${NC}"
        exit 1
    fi
}

# Function to health check
health_check() {
    local container_name="$1"
    local max_attempts=30
    local attempt=1
    
    log "${BLUE}🏥 Performing health check on $container_name...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec "$container_name" curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log "${GREEN}✅ Health check passed${NC}"
            return 0
        fi
        
        log "${YELLOW}⏳ Health check attempt $attempt/$max_attempts...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ Health check failed after $max_attempts attempts${NC}"
    return 1
}

# Function to deploy new version
deploy_new_version() {
    local image="$DOCKER_IMAGE:$TAG"
    local new_container="${CONTAINER_NAME}-new"
    
    log "${BLUE}🚀 Deploying new version...${NC}"
    
    # Stop and remove existing new container if it exists
    docker stop "$new_container" 2>/dev/null || true
    docker rm "$new_container" 2>/dev/null || true
    
    # Start new container
    log "${BLUE}🔄 Starting new container: $new_container${NC}"
    docker run -d \
        --name "$new_container" \
        --network "$NETWORK_NAME" \
        -e NODE_ENV=production \
        -e MONGO_URI=mongodb://$MONGO_CONTAINER:27017/loyalty_program \
        "$image"
    
    # Wait for container to be ready
    sleep 5
    
    # Health check on new container
    if health_check "$new_container"; then
        log "${GREEN}✅ New container is healthy${NC}"
    else
        echo -e "${RED}❌ New container failed health check${NC}"
        docker stop "$new_container"
        docker rm "$new_container"
        exit 1
    fi
}

# Function to switch traffic
switch_traffic() {
    local new_container="${CONTAINER_NAME}-new"
    local old_container="$CONTAINER_NAME"
    
    log "${BLUE}🔄 Switching traffic to new container...${NC}"
    
    # Stop old container
    if docker ps | grep -q "$old_container"; then
        log "${BLUE}⏹️ Stopping old container...${NC}"
        docker stop "$old_container"
        docker rename "$old_container" "$BACKUP_CONTAINER_NAME"
    fi
    
    # Rename new container to main name
    docker rename "$new_container" "$old_container"
    
    # Update port mapping
    docker stop "$old_container"
    docker rm "$old_container"
    
    # Start with proper port mapping
    docker run -d \
        --name "$old_container" \
        --network "$NETWORK_NAME" \
        -p 3000:3000 \
        -e NODE_ENV=production \
        -e MONGO_URI=mongodb://$MONGO_CONTAINER:27017/loyalty_program \
        "$DOCKER_IMAGE:$TAG"
    
    # Final health check
    if health_check "$old_container"; then
        log "${GREEN}✅ Traffic switched successfully${NC}"
        
        # Remove backup container after successful deployment
        docker rm "$BACKUP_CONTAINER_NAME" 2>/dev/null || true
    else
        echo -e "${RED}❌ Final health check failed${NC}"
        rollback
        exit 1
    fi
}

# Function to rollback
rollback() {
    log "${YELLOW}🔄 Rolling back to previous version...${NC}"
    
    # Stop current container
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    
    # Restore backup container
    if docker ps -a | grep -q "$BACKUP_CONTAINER_NAME"; then
        docker rename "$BACKUP_CONTAINER_NAME" "$CONTAINER_NAME"
        docker start "$CONTAINER_NAME"
        log "${GREEN}✅ Rollback completed${NC}"
    else
        echo -e "${RED}❌ No backup container found for rollback${NC}"
    fi
}

# Function to confirm deployment
confirm_deployment() {
    echo -e "${YELLOW}🚀 Ready to deploy $DOCKER_IMAGE:$TAG${NC}"
    echo -e "${YELLOW}This will update the running application${NC}"
    echo ""
    read -p "Continue with deployment? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}❌ Deployment cancelled${NC}"
        exit 0
    fi
}

# Main execution
main() {
    local skip_backup=false
    local force=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--tag)
                TAG="$2"
                shift 2
                ;;
            -s|--skip-backup)
                skip_backup=true
                shift
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -h|--help)
                usage
                ;;
            *)
                echo "Unknown option: $1"
                usage
                ;;
        esac
    done
    
    log "${GREEN}🚀 Starting safe deployment process${NC}"
    log "${GREEN}📦 Image: $DOCKER_IMAGE:$TAG${NC}"
    
    check_prerequisites
    
    if [ "$force" = false ]; then
        confirm_deployment
    fi
    
    pull_image
    
    if [ "$skip_backup" = false ]; then
        backup_database
    fi
    
    deploy_new_version
    switch_traffic
    
    log "${GREEN}🎉 Deployment completed successfully!${NC}"
    log "${GREEN}🌐 Application is now running with tag: $TAG${NC}"
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
fi

# Run main function
main "$@"

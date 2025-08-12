#!/bin/bash

# Database Backup Script for Loyalty Program
# This script creates a backup of MongoDB before deployment

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/var/backups/loyalty-program"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="loyalty_backup_${TIMESTAMP}"
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-loyalty_program}"
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Starting database backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if MongoDB is running
check_mongo() {
    if ! mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        echo -e "${RED}❌ MongoDB is not accessible at $MONGO_HOST:$MONGO_PORT${NC}"
        exit 1
    fi
    log "${GREEN}✅ MongoDB connection verified${NC}"
}

# Function to create backup
create_backup() {
    local backup_path="$BACKUP_DIR/$BACKUP_NAME"
    
    log "${YELLOW}📦 Creating backup: $backup_path${NC}"
    
    # Create MongoDB dump
    if mongodump --host "$MONGO_HOST" --port "$MONGO_PORT" --db "$MONGO_DB" --out "$backup_path"; then
        log "${GREEN}✅ Database backup created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create database backup${NC}"
        exit 1
    fi
    
    # Compress the backup
    log "${YELLOW}🗜️ Compressing backup...${NC}"
    cd "$BACKUP_DIR"
    if tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"; then
        rm -rf "$BACKUP_NAME"
        log "${GREEN}✅ Backup compressed: ${BACKUP_NAME}.tar.gz${NC}"
    else
        echo -e "${RED}❌ Failed to compress backup${NC}"
        exit 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "${YELLOW}🧹 Cleaning up backups older than $RETENTION_DAYS days...${NC}"
    
    find "$BACKUP_DIR" -name "loyalty_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    local remaining_backups=$(find "$BACKUP_DIR" -name "loyalty_backup_*.tar.gz" -type f | wc -l)
    log "${GREEN}✅ Cleanup complete. $remaining_backups backups remaining${NC}"
}

# Function to verify backup
verify_backup() {
    local backup_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    if [ -f "$backup_file" ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "${GREEN}✅ Backup verified: $backup_file ($size)${NC}"
        echo "$backup_file" > "$BACKUP_DIR/latest_backup.txt"
    else
        echo -e "${RED}❌ Backup verification failed${NC}"
        exit 1
    fi
}

# Main execution
main() {
    log "${GREEN}🚀 Starting backup process for database: $MONGO_DB${NC}"
    
    check_mongo
    create_backup
    verify_backup
    cleanup_old_backups
    
    log "${GREEN}🎉 Backup process completed successfully!${NC}"
    log "${GREEN}📁 Backup location: $BACKUP_DIR/${BACKUP_NAME}.tar.gz${NC}"
}

# Run main function
main "$@"

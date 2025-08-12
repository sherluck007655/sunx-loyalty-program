#!/bin/bash

# Database Restore Script for Loyalty Program
# This script restores MongoDB from a backup

set -e  # Exit on any error

# Configuration
BACKUP_DIR="/var/backups/loyalty-program"
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-loyalty_program}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to show usage
usage() {
    echo "Usage: $0 [backup_file]"
    echo ""
    echo "Options:"
    echo "  backup_file    Path to backup file (optional, uses latest if not specified)"
    echo ""
    echo "Examples:"
    echo "  $0                                          # Restore from latest backup"
    echo "  $0 /path/to/loyalty_backup_20240812.tar.gz # Restore from specific backup"
    exit 1
}

# Function to find latest backup
find_latest_backup() {
    local latest_file="$BACKUP_DIR/latest_backup.txt"
    
    if [ -f "$latest_file" ]; then
        cat "$latest_file"
    else
        # Find the most recent backup file
        find "$BACKUP_DIR" -name "loyalty_backup_*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-
    fi
}

# Function to check if MongoDB is running
check_mongo() {
    if ! mongosh --host "$MONGO_HOST" --port "$MONGO_PORT" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        echo -e "${RED}❌ MongoDB is not accessible at $MONGO_HOST:$MONGO_PORT${NC}"
        exit 1
    fi
    log "${GREEN}✅ MongoDB connection verified${NC}"
}

# Function to restore backup
restore_backup() {
    local backup_file="$1"
    local temp_dir="/tmp/loyalty_restore_$$"
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Backup file not found: $backup_file${NC}"
        exit 1
    fi
    
    log "${YELLOW}📦 Extracting backup: $backup_file${NC}"
    
    # Create temporary directory
    mkdir -p "$temp_dir"
    
    # Extract backup
    if tar -xzf "$backup_file" -C "$temp_dir"; then
        log "${GREEN}✅ Backup extracted successfully${NC}"
    else
        echo -e "${RED}❌ Failed to extract backup${NC}"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # Find the database directory
    local db_dir=$(find "$temp_dir" -name "$MONGO_DB" -type d | head -1)
    
    if [ -z "$db_dir" ]; then
        echo -e "${RED}❌ Database directory not found in backup${NC}"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    log "${YELLOW}🔄 Restoring database: $MONGO_DB${NC}"
    
    # Restore the database
    if mongorestore --host "$MONGO_HOST" --port "$MONGO_PORT" --db "$MONGO_DB" --drop "$db_dir"; then
        log "${GREEN}✅ Database restored successfully${NC}"
    else
        echo -e "${RED}❌ Failed to restore database${NC}"
        rm -rf "$temp_dir"
        exit 1
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

# Function to confirm restore
confirm_restore() {
    local backup_file="$1"
    
    echo -e "${YELLOW}⚠️  WARNING: This will replace the current database with backup data!${NC}"
    echo -e "${YELLOW}Database: $MONGO_DB${NC}"
    echo -e "${YELLOW}Backup: $backup_file${NC}"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}❌ Restore cancelled${NC}"
        exit 0
    fi
}

# Main execution
main() {
    local backup_file="$1"
    
    # If no backup file specified, use latest
    if [ -z "$backup_file" ]; then
        backup_file=$(find_latest_backup)
        if [ -z "$backup_file" ]; then
            echo -e "${RED}❌ No backup files found${NC}"
            exit 1
        fi
        log "${GREEN}📁 Using latest backup: $backup_file${NC}"
    fi
    
    log "${GREEN}🚀 Starting restore process${NC}"
    
    check_mongo
    confirm_restore "$backup_file"
    restore_backup "$backup_file"
    
    log "${GREEN}🎉 Restore process completed successfully!${NC}"
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
fi

# Run main function
main "$@"

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

echo "🔍 SunX Loyalty Program - Installer Credentials Extractor"
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the backend directory exists
if [ ! -d "backend" ]; then
    print_error "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if package.json exists in backend
if [ ! -f "backend/package.json" ]; then
    print_error "❌ Backend package.json not found. Please ensure the backend is properly set up."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    print_status "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "✅ Dependencies installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "⚠️  .env file not found. Using default MongoDB connection."
    print_warning "    Make sure MongoDB is running on localhost:27017"
fi

# Run the extraction script
print_status "🚀 Running installer extraction script..."
echo ""

# Execute the Node.js script
node extract-installers.js

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    print_success "✅ Installer extraction completed successfully!"
    echo ""
    print_status "📋 The installer credentials have been displayed above."
    print_status "🔐 Use 'ssh root@45.93.138.5' to connect to your server."
else
    print_error "❌ Installer extraction failed. Please check the error messages above."
    exit 1
fi

echo ""
print_warning "⚠️  SECURITY NOTE:"
print_warning "   - Passwords are hashed and cannot be displayed in plain text"
print_warning "   - Use the password reset feature if you need to reset installer passwords"
print_warning "   - Keep this information secure and do not share it publicly"

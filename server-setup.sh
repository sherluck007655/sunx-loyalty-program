#!/bin/bash

# SunX Loyalty Program - Server Setup Script for Hostinger VPS
# Run this script on your Ubuntu server to prepare it for deployment

set -e

echo "🌞 SunX Loyalty Program - Server Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if running on Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    print_error "This script is designed for Ubuntu. Please run on Ubuntu server."
    exit 1
fi

print_status "Starting server setup for SunX Loyalty Program..."

# Step 1: Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Step 2: Install essential packages
print_status "Installing essential packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    nano \
    htop \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx

# Step 3: Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index
    sudo apt update
    
    # Install Docker
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    print_success "Docker installed successfully!"
else
    print_success "Docker is already installed!"
fi

# Step 4: Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully!"
else
    print_success "Docker Compose is already installed!"
fi

# Step 5: Configure Docker
print_status "Configuring Docker..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Step 6: Configure firewall
print_status "Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow essential ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # Backend API

# Enable firewall
sudo ufw --force enable

print_success "Firewall configured successfully!"

# Step 7: Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Create custom jail for SSH
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

sudo systemctl restart fail2ban
print_success "Fail2ban configured successfully!"

# Step 8: Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/sunx-loyalty
sudo chown -R $USER:$USER /var/www/sunx-loyalty
sudo chmod -R 755 /var/www/sunx-loyalty

# Step 9: Configure Nginx (basic setup)
print_status "Configuring Nginx..."
sudo systemctl stop nginx

# Create basic Nginx config for the application
sudo tee /etc/nginx/sites-available/sunx-loyalty > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/sunx-loyalty /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t
print_success "Nginx configured successfully!"

# Step 10: Create swap file (if not exists)
print_status "Checking swap configuration..."
if ! swapon --show | grep -q "/swapfile"; then
    print_status "Creating swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    print_success "Swap file created successfully!"
else
    print_success "Swap is already configured!"
fi

# Step 11: Optimize system settings
print_status "Optimizing system settings..."

# Increase file limits
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

# Optimize kernel parameters
sudo tee -a /etc/sysctl.conf > /dev/null <<EOF
# Network optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_congestion_control = bbr

# File system optimizations
fs.file-max = 2097152
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

sudo sysctl -p

# Step 12: Create backup directory
print_status "Creating backup directory..."
sudo mkdir -p /var/backups/sunx-loyalty
sudo chown -R $USER:$USER /var/backups/sunx-loyalty

# Step 13: Create log directory
print_status "Creating log directory..."
sudo mkdir -p /var/log/sunx-loyalty
sudo chown -R $USER:$USER /var/log/sunx-loyalty

# Step 14: Install monitoring tools
print_status "Installing monitoring tools..."
sudo apt install -y htop iotop nethogs

# Step 15: Create useful aliases
print_status "Creating useful aliases..."
tee -a ~/.bashrc > /dev/null <<EOF

# SunX Loyalty Program aliases
alias sunx-logs='docker-compose -f /var/www/sunx-loyalty/docker-compose.prod.yml logs -f'
alias sunx-status='docker-compose -f /var/www/sunx-loyalty/docker-compose.prod.yml ps'
alias sunx-restart='cd /var/www/sunx-loyalty && docker-compose -f docker-compose.prod.yml restart'
alias sunx-stop='cd /var/www/sunx-loyalty && docker-compose -f docker-compose.prod.yml down'
alias sunx-start='cd /var/www/sunx-loyalty && docker-compose -f docker-compose.prod.yml up -d'
alias sunx-update='cd /var/www/sunx-loyalty && git pull && docker-compose -f docker-compose.prod.yml up --build -d'
EOF

# Display completion message
echo ""
echo "=============================================="
print_success "🎉 Server setup completed successfully!"
echo "=============================================="
echo ""
echo "📋 What was installed/configured:"
echo "  ✅ System packages updated"
echo "  ✅ Docker and Docker Compose installed"
echo "  ✅ Firewall configured (ports 22, 80, 443, 5000)"
echo "  ✅ Fail2ban configured for SSH protection"
echo "  ✅ Nginx installed and configured"
echo "  ✅ Application directory created: /var/www/sunx-loyalty"
echo "  ✅ Backup directory created: /var/backups/sunx-loyalty"
echo "  ✅ System optimizations applied"
echo "  ✅ Monitoring tools installed"
echo "  ✅ Useful aliases created"
echo ""
echo "🔄 Next steps:"
echo "  1. Upload your application files to /var/www/sunx-loyalty"
echo "  2. Configure your .env.production file"
echo "  3. Run the deployment script: ./deploy.sh"
echo "  4. Configure your domain name (if applicable)"
echo "  5. Set up SSL certificates with: sudo certbot --nginx"
echo ""
print_warning "⚠️  Important:"
echo "  • You may need to log out and back in for Docker group changes to take effect"
echo "  • Change default passwords in your .env.production file"
echo "  • Configure your domain name in Nginx if you have one"
echo ""
print_success "🚀 Your server is now ready for SunX Loyalty Program deployment!"

# Show server information
echo ""
echo "📊 Server Information:"
echo "  🌐 Public IP: $(curl -s ifconfig.me || echo 'Unable to detect')"
echo "  💾 Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  💿 Disk: $(df -h / | awk 'NR==2 {print $2}')"
echo "  🔧 Docker: $(docker --version)"
echo "  🐙 Docker Compose: $(docker-compose --version)"

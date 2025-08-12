# SunX Loyalty Program - Build and Push to Docker Hub (PowerShell)
# Usage: .\build-and-push.ps1 [docker-username] [server-ip]
# Example: .\build-and-push.ps1 sherluck007 123.45.67.89

param(
    [string]$DockerUsername = "sherluck007",
    [string]$ServerIP = "YOUR_SERVER_IP",
    [string]$Version = "latest"
)

Write-Host "🌞 SunX Loyalty Program - Build and Push to Docker Hub" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host "Docker Username: $DockerUsername" -ForegroundColor Green
Write-Host "Server IP: $ServerIP" -ForegroundColor Green
Write-Host "Version: $Version" -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
Write-Host "🔍 Checking Docker installation..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found! Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged into Docker Hub
Write-Host "🔍 Checking Docker Hub login..." -ForegroundColor Cyan
try {
    $dockerInfo = docker info 2>&1
    if ($dockerInfo -match "Username") {
        Write-Host "✅ Already logged into Docker Hub" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not logged into Docker Hub. Please login:" -ForegroundColor Yellow
        Write-Host "Run: docker login" -ForegroundColor Yellow
        Write-Host "Enter your Docker Hub credentials when prompted." -ForegroundColor Yellow
        
        # Prompt for login
        $login = Read-Host "Do you want to login now? (y/n)"
        if ($login -eq "y" -or $login -eq "Y") {
            docker login
        } else {
            Write-Host "❌ Cannot proceed without Docker Hub login." -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "⚠️  Could not check Docker Hub login status" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏗️  Building Docker Images..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Build Frontend Image
Write-Host ""
Write-Host "📦 Building Frontend Image..." -ForegroundColor Blue
Write-Host "Image: ${DockerUsername}/sunx-loyalty-frontend:${Version}" -ForegroundColor Blue

if (Test-Path "frontend/Dockerfile") {
    try {
        docker build -t "${DockerUsername}/sunx-loyalty-frontend:${Version}" ./frontend
        Write-Host "✅ Frontend image built successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to build frontend image!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Frontend Dockerfile not found!" -ForegroundColor Red
    exit 1
}

# Build Backend Image
Write-Host ""
Write-Host "📦 Building Backend Image..." -ForegroundColor Blue
Write-Host "Image: ${DockerUsername}/sunx-loyalty-backend:${Version}" -ForegroundColor Blue

if (Test-Path "backend/Dockerfile") {
    try {
        docker build -t "${DockerUsername}/sunx-loyalty-backend:${Version}" ./backend
        Write-Host "✅ Backend image built successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to build backend image!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Backend Dockerfile not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Pushing Images to Docker Hub..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Push Frontend Image
Write-Host ""
Write-Host "📤 Pushing Frontend Image..." -ForegroundColor Blue
try {
    docker push "${DockerUsername}/sunx-loyalty-frontend:${Version}"
    Write-Host "✅ Frontend image pushed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push frontend image!" -ForegroundColor Red
    Write-Host "Make sure you have created the repository: ${DockerUsername}/sunx-loyalty-frontend" -ForegroundColor Yellow
    exit 1
}

# Push Backend Image
Write-Host ""
Write-Host "📤 Pushing Backend Image..." -ForegroundColor Blue
try {
    docker push "${DockerUsername}/sunx-loyalty-backend:${Version}"
    Write-Host "✅ Backend image pushed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push backend image!" -ForegroundColor Red
    Write-Host "Make sure you have created the repository: ${DockerUsername}/sunx-loyalty-backend" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 SUCCESS! Images pushed to Docker Hub!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your Docker Hub Images:" -ForegroundColor Cyan
Write-Host "• Frontend: https://hub.docker.com/r/${DockerUsername}/sunx-loyalty-frontend" -ForegroundColor Blue
Write-Host "• Backend:  https://hub.docker.com/r/${DockerUsername}/sunx-loyalty-backend" -ForegroundColor Blue
Write-Host ""
Write-Host "🚀 Ready for deployment! Use these commands on your server:" -ForegroundColor Yellow
Write-Host "curl -sSL https://raw.githubusercontent.com/${DockerUsername}/sunx-loyalty/main/one-command-deploy.sh | bash -s ${DockerUsername}" -ForegroundColor Green
Write-Host ""
Write-Host "🌞 SunX Loyalty Program deployment ready!" -ForegroundColor Yellow

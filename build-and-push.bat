@echo off
REM SunX Loyalty Program - Build and Push to Docker Hub (Windows Batch)
REM Usage: build-and-push.bat [docker-username] [server-ip]
REM Example: build-and-push.bat sherluck007 123.45.67.89

setlocal enabledelayedexpansion

REM Configuration
set DOCKER_USERNAME=%1
if "%DOCKER_USERNAME%"=="" set DOCKER_USERNAME=sherluck007

set SERVER_IP=%2
if "%SERVER_IP%"=="" set SERVER_IP=YOUR_SERVER_IP

set VERSION=%3
if "%VERSION%"=="" set VERSION=latest

echo.
echo 🌞 SunX Loyalty Program - Build and Push to Docker Hub
echo =====================================================
echo Docker Username: %DOCKER_USERNAME%
echo Server IP: %SERVER_IP%
echo Version: %VERSION%
echo.

REM Check if Docker is installed
echo 🔍 Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found! Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker found!

REM Check Docker Hub login
echo.
echo 🔍 Checking Docker Hub login...
docker info 2>nul | findstr "Username" >nul
if errorlevel 1 (
    echo ⚠️  Not logged into Docker Hub. Please login:
    echo Running: docker login
    docker login
    if errorlevel 1 (
        echo ❌ Docker login failed!
        pause
        exit /b 1
    )
) else (
    echo ✅ Already logged into Docker Hub
)

echo.
echo 🏗️  Building Docker Images...
echo ================================

REM Build Frontend Image
echo.
echo 📦 Building Frontend Image...
echo Image: %DOCKER_USERNAME%/sunx-loyalty-frontend:%VERSION%

if not exist "frontend\Dockerfile" (
    echo ❌ Frontend Dockerfile not found!
    pause
    exit /b 1
)

docker build -t %DOCKER_USERNAME%/sunx-loyalty-frontend:%VERSION% ./frontend
if errorlevel 1 (
    echo ❌ Failed to build frontend image!
    pause
    exit /b 1
)
echo ✅ Frontend image built successfully!

REM Build Backend Image
echo.
echo 📦 Building Backend Image...
echo Image: %DOCKER_USERNAME%/sunx-loyalty-backend:%VERSION%

if not exist "backend\Dockerfile" (
    echo ❌ Backend Dockerfile not found!
    pause
    exit /b 1
)

docker build -t %DOCKER_USERNAME%/sunx-loyalty-backend:%VERSION% ./backend
if errorlevel 1 (
    echo ❌ Failed to build backend image!
    pause
    exit /b 1
)
echo ✅ Backend image built successfully!

echo.
echo 🚀 Pushing Images to Docker Hub...
echo ===================================

REM Push Frontend Image
echo.
echo 📤 Pushing Frontend Image...
docker push %DOCKER_USERNAME%/sunx-loyalty-frontend:%VERSION%
if errorlevel 1 (
    echo ❌ Failed to push frontend image!
    echo Make sure you have created the repository: %DOCKER_USERNAME%/sunx-loyalty-frontend
    pause
    exit /b 1
)
echo ✅ Frontend image pushed successfully!

REM Push Backend Image
echo.
echo 📤 Pushing Backend Image...
docker push %DOCKER_USERNAME%/sunx-loyalty-backend:%VERSION%
if errorlevel 1 (
    echo ❌ Failed to push backend image!
    echo Make sure you have created the repository: %DOCKER_USERNAME%/sunx-loyalty-backend
    pause
    exit /b 1
)
echo ✅ Backend image pushed successfully!

echo.
echo 🎉 SUCCESS! Images pushed to Docker Hub!
echo =========================================
echo.
echo 📋 Your Docker Hub Images:
echo • Frontend: https://hub.docker.com/r/%DOCKER_USERNAME%/sunx-loyalty-frontend
echo • Backend:  https://hub.docker.com/r/%DOCKER_USERNAME%/sunx-loyalty-backend
echo.
echo 🚀 Ready for deployment! Use this command on your server:
echo curl -sSL https://raw.githubusercontent.com/%DOCKER_USERNAME%/sunx-loyalty/main/one-command-deploy.sh ^| bash -s %DOCKER_USERNAME%
echo.
echo 🌞 SunX Loyalty Program deployment ready!
echo.
pause

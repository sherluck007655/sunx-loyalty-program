@echo off
REM SunX Loyalty Program - Production Start Script (Windows)
REM This script starts the application in production mode without data cleaning

echo.
echo 🌞 SunX Loyalty Program - Production Startup
echo =============================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "uploads" mkdir uploads
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups
if not exist "data" mkdir data
if not exist "data\mongodb" mkdir data\mongodb

REM Stop any existing containers
echo [INFO] Stopping any existing containers...
docker-compose -f docker-compose.production.yml down

REM Pull latest images
echo [INFO] Pulling latest images...
docker-compose -f docker-compose.production.yml pull

REM Start services
echo [INFO] Starting production services...
docker-compose -f docker-compose.production.yml up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if backend is healthy
echo [INFO] Checking backend health...
for /l %%i in (1,1,30) do (
    curl -f http://localhost:5000/health >nul 2>&1
    if not errorlevel 1 (
        echo [SUCCESS] Backend is healthy!
        goto :backend_ready
    )
    timeout /t 2 /nobreak >nul
)
echo [WARNING] Backend health check timeout, but continuing...

:backend_ready

REM Check if frontend is accessible
echo [INFO] Checking frontend accessibility...
for /l %%i in (1,1,15) do (
    curl -f http://localhost:3000 >nul 2>&1
    if not errorlevel 1 (
        echo [SUCCESS] Frontend is accessible!
        goto :frontend_ready
    )
    timeout /t 2 /nobreak >nul
)
echo [WARNING] Frontend accessibility check timeout, but continuing...

:frontend_ready

REM Seed only essential data (admin account) without cleaning existing data
echo [INFO] Ensuring essential data exists (preserving all existing data)...
docker-compose -f docker-compose.production.yml exec -T backend npm run db:seed-essential >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Essential data verified - all existing data preserved!
) else (
    echo [WARNING] Essential data seeding failed or admin already exists
)

REM Show status
echo [INFO] Checking container status...
docker-compose -f docker-compose.production.yml ps

REM Run data integrity check
echo [INFO] Running data integrity check...
docker-compose -f docker-compose.production.yml exec -T backend npm run db:check >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Data integrity check completed!
) else (
    echo [WARNING] Data integrity check failed
)

echo.
echo ==============================================
echo [SUCCESS] 🎉 Production deployment completed!
echo ==============================================
echo.
echo [SUCCESS] 🌐 Your SunX Loyalty Program is now running:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo    Health Check: http://localhost:5000/health
echo.
echo [SUCCESS] 🔑 Default Admin Credentials:
echo    Email: admin@sunx.com
echo    Password: admin123
echo.
echo [SUCCESS] 📋 Management Commands:
echo    Check Status: docker-compose -f docker-compose.production.yml ps
echo    View Logs: docker-compose -f docker-compose.production.yml logs -f
echo    Stop Services: docker-compose -f docker-compose.production.yml down
echo    Data Check: docker-compose -f docker-compose.production.yml exec backend npm run db:check
echo.
echo [WARNING] ⚠️  IMPORTANT: This production setup preserves all existing data!
echo    No data cleaning or sample data insertion occurs.
echo.
pause

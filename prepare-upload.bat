@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 SunX Loyalty Program - Prepare Files for Upload
echo ==================================================

REM Set your project directory (change this to your actual project path)
set "PROJECT_DIR=%cd%"
set "UPLOAD_DIR=%PROJECT_DIR%\upload-package"
set "DATE_TIME=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "DATE_TIME=%DATE_TIME: =0%"

echo 📁 Project Directory: %PROJECT_DIR%
echo 📦 Upload Package: %UPLOAD_DIR%
echo 📅 Timestamp: %DATE_TIME%
echo.

REM Create upload directory
if exist "%UPLOAD_DIR%" (
    echo 🗑️  Cleaning existing upload directory...
    rmdir /s /q "%UPLOAD_DIR%"
)
mkdir "%UPLOAD_DIR%"

echo 📋 Creating upload package...
echo ==============================

REM Copy backend files (excluding sensitive data)
if exist "backend" (
    echo 📦 Copying backend files...
    xcopy "backend" "%UPLOAD_DIR%\backend" /E /I /Q /EXCLUDE:upload-exclude.txt
    echo ✅ Backend files copied
) else (
    echo ⚠️  Backend directory not found
)

REM Copy frontend files
if exist "frontend" (
    echo 📦 Copying frontend files...
    xcopy "frontend" "%UPLOAD_DIR%\frontend" /E /I /Q /EXCLUDE:upload-exclude.txt
    echo ✅ Frontend files copied
) else (
    echo ⚠️  Frontend directory not found
)

REM Copy root files (docker-compose, etc.)
echo 📦 Copying configuration files...
if exist "docker-compose.yml" copy "docker-compose.yml" "%UPLOAD_DIR%\"
if exist "docker-compose.prod.yml" copy "docker-compose.prod.yml" "%UPLOAD_DIR%\"
if exist "package.json" copy "package.json" "%UPLOAD_DIR%\"
if exist "README.md" copy "README.md" "%UPLOAD_DIR%\"
if exist ".gitignore" copy ".gitignore" "%UPLOAD_DIR%\"

REM Copy any additional directories
if exist "nginx" (
    xcopy "nginx" "%UPLOAD_DIR%\nginx" /E /I /Q
    echo ✅ Nginx configuration copied
)

if exist "scripts" (
    xcopy "scripts" "%UPLOAD_DIR%\scripts" /E /I /Q
    echo ✅ Scripts copied
)

if exist "docs" (
    xcopy "docs" "%UPLOAD_DIR%\docs" /E /I /Q
    echo ✅ Documentation copied
)

REM Create exclusion list for sensitive files
echo node_modules > upload-exclude.txt
echo .env >> upload-exclude.txt
echo .env.local >> upload-exclude.txt
echo .env.production >> upload-exclude.txt
echo uploads >> upload-exclude.txt
echo logs >> upload-exclude.txt
echo .git >> upload-exclude.txt
echo dist >> upload-exclude.txt
echo build >> upload-exclude.txt
echo coverage >> upload-exclude.txt
echo .nyc_output >> upload-exclude.txt
echo *.log >> upload-exclude.txt

REM Create deployment info file
echo Creating deployment information...
(
echo SunX Loyalty Program - Upload Package
echo ====================================
echo.
echo Package Created: %DATE% %TIME%
echo Source Directory: %PROJECT_DIR%
echo Target Server: loyalty.sunxpv.com ^(45.93.138.5^)
echo.
echo IMPORTANT NOTES:
echo - This package excludes node_modules, .env files, and uploads
echo - Database data will be preserved on the server
echo - Existing .env file on server will be kept
echo - Run deployment script after upload
echo.
echo FILES INCLUDED:
) > "%UPLOAD_DIR%\DEPLOYMENT_INFO.txt"

REM List contents
dir "%UPLOAD_DIR%" >> "%UPLOAD_DIR%\DEPLOYMENT_INFO.txt"

REM Create upload script for the server
(
echo #!/bin/bash
echo # Server Upload Deployment Script
echo # Run this on the server after uploading files
echo.
echo echo "🚀 Starting deployment of uploaded files..."
echo echo "============================================"
echo.
echo APP_DIR="/var/www/sunx-loyalty"
echo UPLOAD_DIR="/tmp/sunx-loyalty-upload"
echo BACKUP_DIR="/root/backups/pre-upload-$(date +%%Y%%m%%d_%%H%%M%%S)"
echo.
echo # Create backup before deployment
echo echo "💾 Creating pre-deployment backup..."
echo mkdir -p "$BACKUP_DIR"
echo cp -r "$APP_DIR" "$BACKUP_DIR/current_app"
echo.
echo # Preserve important files
echo echo "🔒 Preserving important server files..."
echo cp "$APP_DIR/.env" "$BACKUP_DIR/env_backup" 2>/dev/null ^|^| echo "No .env found"
echo cp -r "$APP_DIR/uploads" "$BACKUP_DIR/uploads_backup" 2>/dev/null ^|^| echo "No uploads found"
echo cp -r "$APP_DIR/logs" "$BACKUP_DIR/logs_backup" 2>/dev/null ^|^| echo "No logs found"
echo.
echo # Stop services
echo echo "⏹️  Stopping services..."
echo cd "$APP_DIR"
echo docker-compose down
echo.
echo # Deploy new files
echo echo "📦 Deploying new files..."
echo rsync -av --exclude='.env' --exclude='uploads' --exclude='logs' --exclude='node_modules' "$UPLOAD_DIR/" "$APP_DIR/"
echo.
echo # Restore preserved files
echo echo "🔄 Restoring preserved files..."
echo cp "$BACKUP_DIR/env_backup" "$APP_DIR/.env" 2>/dev/null ^|^| echo "No .env to restore"
echo cp -r "$BACKUP_DIR/uploads_backup" "$APP_DIR/uploads" 2>/dev/null ^|^| echo "No uploads to restore"
echo cp -r "$BACKUP_DIR/logs_backup" "$APP_DIR/logs" 2>/dev/null ^|^| echo "No logs to restore"
echo.
echo # Rebuild and start
echo echo "🔨 Rebuilding and starting services..."
echo docker-compose build --no-cache
echo docker-compose up -d
echo.
echo # Health check
echo echo "🏥 Performing health check..."
echo sleep 30
echo if curl -f http://localhost:5000/api/health 2^>/dev/null; then
echo     echo "✅ Deployment successful!"
echo     echo "🌐 Website: https://loyalty.sunxpv.com"
echo     echo "🔧 Admin: https://loyalty.sunxpv.com/admin"
echo else
echo     echo "❌ Health check failed, rolling back..."
echo     cp -r "$BACKUP_DIR/current_app/"* "$APP_DIR/"
echo     docker-compose up -d
echo     echo "🔄 Rollback completed"
echo fi
) > "%UPLOAD_DIR%\deploy-uploaded-files.sh"

REM Create compression script
echo 📦 Creating compressed package...
powershell -command "Compress-Archive -Path '%UPLOAD_DIR%\*' -DestinationPath '%PROJECT_DIR%\sunx-loyalty-upload-%DATE_TIME%.zip' -Force"

if exist "%PROJECT_DIR%\sunx-loyalty-upload-%DATE_TIME%.zip" (
    echo ✅ Compressed package created: sunx-loyalty-upload-%DATE_TIME%.zip
    for %%I in ("%PROJECT_DIR%\sunx-loyalty-upload-%DATE_TIME%.zip") do echo 📊 Package size: %%~zI bytes
) else (
    echo ❌ Failed to create compressed package
)

echo.
echo 🎉 UPLOAD PACKAGE READY!
echo ========================
echo 📁 Package Directory: %UPLOAD_DIR%
echo 📦 Compressed File: sunx-loyalty-upload-%DATE_TIME%.zip
echo.
echo 📋 NEXT STEPS:
echo 1. Upload the compressed file to your server
echo 2. Extract it on the server
echo 3. Run the deployment script
echo.
echo 💡 UPLOAD COMMANDS FOR SERVER:
echo scp sunx-loyalty-upload-%DATE_TIME%.zip root@45.93.138.5:/tmp/
echo.
echo ⚠️  IMPORTANT:
echo - Database data will be preserved
echo - Existing .env file will be kept
echo - Uploads directory will be preserved
echo - Automatic rollback on failure
echo.

REM Cleanup
del upload-exclude.txt 2>nul

pause

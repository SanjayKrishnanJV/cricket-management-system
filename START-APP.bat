@echo off
echo ========================================
echo   Cricket Management System - Startup
echo ========================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo.
    echo Please start Docker Desktop first:
    echo 1. Look for Docker icon in system tray
    echo 2. If not running, open Docker Desktop from Start Menu
    echo 3. Wait for Docker to start completely
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Docker is running...
echo.
echo Starting Cricket Management System...
echo.
echo This will:
echo  - Start PostgreSQL database
echo  - Start Backend API server
echo  - Start Frontend web server
echo.
echo Please wait, this may take 1-2 minutes on first run...
echo.

docker-compose -f docker-compose.dev.yml up -d

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Application is starting...
    echo ========================================
    echo.
    echo Services are starting in the background.
    echo Wait about 60-90 seconds for first-time setup, then open:
    echo.
    echo   http://localhost:3000
    echo.
    echo Login with:
    echo   Email: admin@cricket.com
    echo   Password: password123
    echo.
    echo To view logs:
    echo   docker-compose -f docker-compose.dev.yml logs -f
    echo.
    echo To stop the application:
    echo   docker-compose -f docker-compose.dev.yml down
    echo.

    :: Wait 5 seconds then open browser
    timeout /t 5 /nobreak >nul
    start http://localhost:3000

) else (
    echo.
    echo ERROR: Failed to start the application!
    echo.
    echo Troubleshooting:
    echo 1. Make sure Docker Desktop is running
    echo 2. Check if ports 3000, 5000, 5432 are available
    echo 3. Try: docker-compose -f docker-compose.dev.yml down
    echo 4. Then run this script again
    echo.
)

echo.
pause

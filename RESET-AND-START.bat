@echo off
echo ========================================
echo   Cricket Management System - Reset
echo ========================================
echo.
echo This will:
echo  1. Stop all containers
echo  2. Remove old volumes
echo  3. Start fresh with fixed configuration
echo.
pause

echo.
echo Stopping containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo Removing volumes (this resets the database)...
docker-compose -f docker-compose.dev.yml down -v

echo.
echo Starting application with fixed configuration...
echo This will take 60-90 seconds for first-time setup...
echo.
docker-compose -f docker-compose.dev.yml up -d

echo.
echo ========================================
echo   Application is starting!
echo ========================================
echo.
echo Please wait 60-90 seconds, then open:
echo   http://localhost:3000
echo.
echo Login with:
echo   Email: admin@cricket.com
echo   Password: password123
echo.
echo To view progress, run: VIEW-LOGS.bat
echo.

timeout /t 5 /nobreak >nul
start http://localhost:3000

pause

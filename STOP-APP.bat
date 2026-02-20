@echo off
echo ========================================
echo   Cricket Management System - Shutdown
echo ========================================
echo.

docker-compose -f docker-compose.dev.yml down

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Application stopped successfully!
    echo ========================================
    echo.
) else (
    echo.
    echo ERROR: Failed to stop the application!
    echo.
)

echo.
pause

@echo off
echo ========================================
echo   Cricket Management System - Logs
echo ========================================
echo.
echo Press Ctrl+C to exit logs view
echo.
timeout /t 2 /nobreak >nul

docker-compose -f docker-compose.dev.yml logs -f

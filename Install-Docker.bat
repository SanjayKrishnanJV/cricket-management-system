@echo off
echo ========================================
echo    Docker Desktop Installation
echo ========================================
echo.
echo This will install Docker Desktop on your Windows 11 system.
echo.
echo Please allow Administrator privileges when prompted.
echo.
pause

PowerShell -NoProfile -ExecutionPolicy Bypass -Command "& {Start-Process PowerShell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File ""%~dp0install-docker.ps1""' -Verb RunAs}"

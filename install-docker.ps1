# Docker Desktop Installation Script for Windows
# Run this as Administrator

Write-Host "🐳 Docker Desktop Installation Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Press Windows + X" -ForegroundColor Yellow
    Write-Host "2. Select 'Windows PowerShell (Admin)' or 'Terminal (Admin)'" -ForegroundColor Yellow
    Write-Host "3. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Check if Docker is already installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerInstalled) {
    Write-Host "✅ Docker is already installed!" -ForegroundColor Green
    docker --version
    docker-compose --version
    Write-Host ""
    Write-Host "You can now run the Cricket Management System:" -ForegroundColor Cyan
    Write-Host "cd C:\Users\Sanjay.KrishnanJV\cricket-management-system" -ForegroundColor Yellow
    Write-Host "docker-compose up -d" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

Write-Host "📥 Docker not found. Starting installation..." -ForegroundColor Yellow
Write-Host ""

# Check if installer exists
$installerPath = "C:\Users\SANJAY~1.KRI\AppData\Local\Temp\DockerDesktopInstaller.exe"

if (-not (Test-Path $installerPath)) {
    Write-Host "❌ Installer not found at: $installerPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Downloading Docker Desktop..." -ForegroundColor Yellow

    $downloadUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $installerPath = "$env:TEMP\DockerDesktopInstaller.exe"

    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "✅ Download complete!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Download failed: $_" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "✅ Installer found: $installerPath" -ForegroundColor Green
Write-Host ""

# Enable WSL 2 (recommended for Windows 11)
Write-Host "🔧 Checking WSL 2..." -ForegroundColor Cyan
$wslStatus = wsl --status 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "📥 Installing WSL 2..." -ForegroundColor Yellow
    try {
        wsl --install --no-distribution
        Write-Host "✅ WSL 2 installed" -ForegroundColor Green
        Write-Host "⚠️  You may need to restart your computer after Docker installation" -ForegroundColor Yellow
    } catch {
        Write-Host "⚠️  Could not install WSL 2 automatically" -ForegroundColor Yellow
        Write-Host "You can install it manually later if needed" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ WSL 2 is already available" -ForegroundColor Green
}

Write-Host ""

# Install Docker Desktop
Write-Host "🚀 Starting Docker Desktop installation..." -ForegroundColor Cyan
Write-Host "This will take 2-3 minutes..." -ForegroundColor Yellow
Write-Host ""

try {
    # Run installer with quiet mode
    Start-Process -FilePath $installerPath -ArgumentList "install", "--quiet", "--accept-license" -Wait -NoNewWindow

    Write-Host "✅ Docker Desktop installed successfully!" -ForegroundColor Green
    Write-Host ""

    # Start Docker Desktop
    Write-Host "🚀 Starting Docker Desktop..." -ForegroundColor Cyan
    $dockerDesktopPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    if (Test-Path $dockerDesktopPath) {
        Start-Process $dockerDesktopPath
        Write-Host "✅ Docker Desktop is starting..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Please wait for Docker to fully start (whale icon in system tray should be steady)" -ForegroundColor Yellow
        Write-Host ""
    }

    Write-Host "✅ Installation Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Wait for Docker Desktop to start (check system tray)" -ForegroundColor White
    Write-Host "2. Accept the Docker Subscription Service Agreement" -ForegroundColor White
    Write-Host "3. Run the Cricket Management System:" -ForegroundColor White
    Write-Host ""
    Write-Host "   cd C:\Users\Sanjay.KrishnanJV\cricket-management-system" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host ""

    $restart = Read-Host "Do you need to restart your computer now? (y/n)"
    if ($restart -eq 'y' -or $restart -eq 'Y') {
        Write-Host "Restarting in 10 seconds..." -ForegroundColor Yellow
        shutdown /r /t 10
    }

} catch {
    Write-Host "❌ Installation failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please try manual installation:" -ForegroundColor Yellow
    Write-Host "1. Double-click: $installerPath" -ForegroundColor Yellow
    Write-Host "2. Follow the installation wizard" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Read-Host "Press Enter to exit"

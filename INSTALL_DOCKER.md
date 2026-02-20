# 🐳 Docker Installation Guide for Windows 11

## Docker Desktop has been downloaded!

Location: `C:\Users\SANJAY~1.KRI\AppData\Local\Temp\DockerDesktopInstaller.exe`

## Installation Steps

### Option 1: Automated Installation (Recommended)

I've prepared a PowerShell script to install Docker for you.

1. **Open PowerShell as Administrator**
   - Press `Windows + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run the installation script**
   ```powershell
   cd C:\Users\Sanjay.KrishnanJV\cricket-management-system
   .\install-docker.ps1
   ```

### Option 2: Manual Installation

1. **Run the installer**
   - Double-click on: `C:\Users\SANJAY~1.KRI\AppData\Local\Temp\DockerDesktopInstaller.exe`
   - Or run from PowerShell:
     ```powershell
     Start-Process -FilePath "C:\Users\SANJAY~1.KRI\AppData\Local\Temp\DockerDesktopInstaller.exe" -Wait
     ```

2. **Follow the installation wizard**
   - ✅ Check "Use WSL 2 instead of Hyper-V" (recommended)
   - ✅ Check "Add shortcut to desktop"
   - Click "Ok" to install

3. **Wait for installation** (takes 2-3 minutes)

4. **Restart your computer** when prompted

5. **Start Docker Desktop**
   - Docker will start automatically after restart
   - Or launch from Start Menu → "Docker Desktop"

6. **Accept the Docker Subscription Service Agreement**

7. **Wait for Docker to start** (you'll see the whale icon in the system tray)

## Verify Installation

After Docker starts, open PowerShell and run:

```powershell
docker --version
docker-compose --version
```

You should see version information for both.

## System Requirements

✅ Windows 11 Enterprise (Your system)
✅ 64-bit processor
✅ 4GB RAM minimum (8GB recommended)
✅ Virtualization enabled in BIOS

## Enable WSL 2 (If not already enabled)

If you chose WSL 2 during installation, you may need to enable it:

```powershell
# Open PowerShell as Administrator
wsl --install
wsl --set-default-version 2
```

Then restart your computer.

## Troubleshooting

### Issue: "WSL 2 installation is incomplete"

**Solution:**
```powershell
wsl --install
wsl --update
```

### Issue: "Virtualization is not enabled"

**Solution:**
1. Restart computer and enter BIOS (usually F2, F10, or Del during boot)
2. Find "Virtualization Technology" or "Intel VT-x" / "AMD-V"
3. Enable it
4. Save and exit BIOS

### Issue: "Docker daemon is not running"

**Solution:**
1. Right-click Docker Desktop icon in system tray
2. Click "Restart Docker Desktop"
3. Wait for it to start (whale icon should be steady, not animated)

### Issue: Hyper-V conflicts

**Solution:**
Use WSL 2 instead of Hyper-V (recommended for Windows 11)

## After Installation

Once Docker is running, you can start the Cricket Management System:

```bash
cd C:\Users\Sanjay.KrishnanJV\cricket-management-system
docker-compose up -d
```

Then open: http://localhost:3000

## Alternative: Docker Desktop Download Link

If you need to download again: https://www.docker.com/products/docker-desktop/

---

**Need help? Let me know which step you're stuck on!**

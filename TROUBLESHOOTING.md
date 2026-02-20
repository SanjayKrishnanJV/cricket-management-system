# 🔧 Troubleshooting Guide

## Issue: Docker Build Failed

If you saw the error `"/frontend": not found` or similar, **I've fixed it!**

### What Was Fixed:
1. ✅ Updated Dockerfiles to use correct build context
2. ✅ Created simpler development Docker Compose file
3. ✅ Updated startup scripts

### Try Again Now:

1. **Stop any running containers:**
   ```
   Double-click: STOP-APP.bat
   ```

2. **Start the application:**
   ```
   Double-click: START-APP.bat
   ```

3. **Wait 60-90 seconds** for first-time setup (it installs packages)

4. **Open browser:** http://localhost:3000

---

## Common Issues & Solutions

### 1. Port Already in Use

**Error:** `port is already allocated`

**Solution:**
```bash
# Find what's using the port (PowerShell as Admin)
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :5432

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

Or change ports in `docker-compose.dev.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### 2. Docker Not Running

**Error:** `ERROR: Docker is not running!`

**Solution:**
1. Open Docker Desktop from Start Menu
2. Wait for it to fully start (whale icon steady in tray)
3. Run START-APP.bat again

### 3. Slow First Startup

**Issue:** Application takes forever to start

**Explanation:** First run needs to:
- Download Node.js images (~200MB)
- Install npm packages (~500MB)
- Run database migrations
- Seed database with sample data

**Solution:** Just wait! It takes 60-90 seconds first time. Subsequent starts are ~10 seconds.

### 4. Can't Access http://localhost:3000

**Checklist:**
```bash
# 1. Check if containers are running
docker ps

# You should see 3 containers:
# - cricket-postgres
# - cricket-backend
# - cricket-frontend
```

```bash
# 2. Check logs for errors
Double-click: VIEW-LOGS.bat
```

```bash
# 3. Wait longer (backend needs to connect to database first)
# Frontend starts after backend is ready
```

### 5. Database Connection Error

**Error:** `Can't connect to database`

**Solution:**
```bash
# 1. Stop everything
docker-compose -f docker-compose.dev.yml down

# 2. Remove volumes (resets database)
docker-compose -f docker-compose.dev.yml down -v

# 3. Start again
Double-click: START-APP.bat
```

### 6. "Module not found" Errors

**Solution:**
```bash
# Clear node_modules volumes and rebuild
docker-compose -f docker-compose.dev.yml down
docker volume rm cricket-management-system_backend_node_modules
docker volume rm cricket-management-system_frontend_node_modules
Double-click: START-APP.bat
```

### 7. Prisma Migration Errors

**Error:** `Prisma migrate failed`

**Solution:**
```bash
# Reset database completely
docker-compose -f docker-compose.dev.yml down -v
Double-click: START-APP.bat
```

### 8. Windows Firewall Blocking

**Issue:** Can't access from browser

**Solution:**
1. Windows Defender Firewall → Allow an app
2. Find "Docker Desktop" and allow it
3. Restart Docker Desktop

---

## Useful Commands

### View Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### Stop Everything
```bash
Double-click: STOP-APP.bat
# or
docker-compose -f docker-compose.dev.yml down
```

### Complete Reset (removes database data)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### View Logs
```bash
Double-click: VIEW-LOGS.bat
# or
docker-compose -f docker-compose.dev.yml logs -f

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Restart Single Service
```bash
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml restart frontend
```

### Check Docker Disk Usage
```bash
docker system df
```

### Clean Up Docker (frees space)
```bash
docker system prune -a
```

---

## Still Having Issues?

1. **Check Docker Desktop:**
   - Open Docker Desktop
   - Go to Troubleshoot
   - Click "Clean / Purge data"
   - Restart Docker Desktop

2. **Check System Requirements:**
   - Windows 11 ✅
   - 8GB RAM minimum
   - 10GB free disk space
   - Virtualization enabled in BIOS

3. **WSL 2 Issues:**
   ```powershell
   # Update WSL
   wsl --update

   # Set WSL 2 as default
   wsl --set-default-version 2
   ```

4. **Complete Fresh Start:**
   ```bash
   # Stop everything
   docker-compose -f docker-compose.dev.yml down -v

   # Remove all containers and images
   docker system prune -a

   # Restart Docker Desktop

   # Start app again
   Double-click: START-APP.bat
   ```

---

## Quick Health Check

Run these to verify everything is working:

```bash
# 1. Docker is running
docker --version

# 2. Containers are up
docker ps

# 3. Backend is responding
curl http://localhost:5000/health

# 4. Database is accessible
docker exec cricket-postgres pg_isready -U postgres

# 5. Frontend is serving
curl http://localhost:3000
```

---

## Getting Help

If you're still stuck:

1. Run VIEW-LOGS.bat and check for error messages
2. Take a screenshot of the error
3. Note which step you're stuck on
4. Share the information for specific help

---

**Most issues are solved by:**
1. Waiting longer (first startup takes time)
2. Restarting Docker Desktop
3. Running: `docker-compose -f docker-compose.dev.yml down -v` then starting again

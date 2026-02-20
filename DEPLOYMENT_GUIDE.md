# 🚀 Cricket Management System - Deployment Guide

## Quick Links
- **Repository:** https://github.com/SanjayKrishnanJV/cricket-management-system
- **Recommended Stack:** Vercel (Frontend) + Railway (Backend + DB)

---

## 📋 Option 1: Vercel + Railway (Recommended)

### Cost: FREE (with limitations)
- **Vercel:** Free tier for hobby projects
- **Railway:** $5/month credit (renews monthly)

---

## Part A: Deploy Backend + Database on Railway

### 1. Create Railway Account
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway
4. Verify your email

### 2. Create PostgreSQL Database
1. In Railway Dashboard, click **"New Project"**
2. Select **"Provision PostgreSQL"**
3. Wait 30 seconds for database to provision
4. Click on the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the **DATABASE_URL** (you'll need this)

### 3. Deploy Backend Service
1. In Railway Dashboard, click **"New"** → **"GitHub Repo"**
2. Select **cricket-management-system**
3. Railway will detect your repository

### 4. Configure Backend Service
1. Click on the backend service
2. Go to **"Settings"**
3. Set **Root Directory:** `backend`
4. Go to **"Variables"** tab
5. Click **"New Variable"** and add these:

```env
DATABASE_URL=postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app-name.vercel.app
```

**Important:**
- Replace `DATABASE_URL` with the one you copied from PostgreSQL service
- Change `JWT_SECRET` to a random string (at least 32 characters)
- `FRONTEND_URL` will be updated after deploying frontend

### 5. Set Build & Start Commands
1. In Settings, find **"Deploy"** section
2. Set **Build Command:**
   ```bash
   npm install && npx prisma generate && npx prisma migrate deploy && npm run build
   ```
3. Set **Start Command:**
   ```bash
   npm run start
   ```

### 6. Generate Public URL
1. In Settings, go to **"Networking"**
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://cricket-backend-production-xxxx.up.railway.app`
4. **Copy this URL** - you'll need it for frontend

### 7. Deploy!
1. Click **"Deploy"** or push to GitHub (auto-deploys)
2. Wait 3-5 minutes for build
3. Check **"Deployments"** tab for status
4. If successful, your backend is live!

### 8. Seed Database (Optional)
After first successful deployment:
```bash
# In Railway CLI or add as a one-time variable:
npx prisma db seed
```

---

## Part B: Deploy Frontend on Vercel

### 1. Create Vercel Account
1. Go to https://vercel.com
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel

### 2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **cricket-management-system** repository
3. Click **"Import"**

### 3. Configure Project Settings
Vercel will auto-detect Next.js settings, but verify:

```
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: (leave default)
Install Command: npm install
```

### 4. Add Environment Variables
Before deploying, click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://cricket-backend-production-xxxx.up.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://cricket-backend-production-xxxx.up.railway.app
```

**Important:** Replace with YOUR Railway backend URL from Part A, Step 6

### 5. Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app will be live at: `https://your-app-name.vercel.app`

### 6. Update Railway Backend
**Go back to Railway:**
1. Open your backend service
2. Go to **"Variables"**
3. Update **FRONTEND_URL** with your Vercel URL:
   ```env
   FRONTEND_URL=https://your-app-name.vercel.app
   ```
4. Click **"Redeploy"** (Railway will restart with new variable)

---

## ✅ Verification Checklist

### Test Backend
```bash
curl https://your-backend.up.railway.app/health
# Should return: {"status":"OK","database":"connected"}
```

### Test Frontend
1. Open `https://your-app-name.vercel.app`
2. Should see login page
3. Try logging in with test credentials:
   - Email: `admin@cricket.com`
   - Password: `password123`

### Test Real-time Features
1. Open a match page
2. Open same match in another browser/tab
3. Record a ball
4. Score should update in both tabs instantly

---

## 📋 Option 2: All on Render (Alternative)

### Cost: FREE (with cold starts)
**Note:** Free tier sleeps after 15 minutes of inactivity. First request takes 30-60 seconds.

### 1. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub

### 2. Deploy PostgreSQL
1. Click **"New +"** → **"PostgreSQL"**
2. Name: `cricket-db`
3. Database: `cricket_management`
4. User: `postgres`
5. Region: Choose closest to you
6. Plan: **Free**
7. Click **"Create Database"**
8. Copy **"Internal Database URL"** from the dashboard

### 3. Deploy Backend Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `cricket-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy && npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
   - **Plan:** Free

4. Add Environment Variables:
   ```env
   DATABASE_URL=<your-internal-database-url-from-step-2>
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://cricket-app.onrender.com
   ```

5. Click **"Create Web Service"**
6. Wait 5-7 minutes for deployment
7. Copy your service URL (e.g., `https://cricket-backend.onrender.com`)

### 4. Deploy Frontend Static Site
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `cricket-frontend`
   - **Root Directory:** `frontend`
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `out`

   **IMPORTANT:** Update frontend build to export static:
   - In `frontend/next.config.js`, add: `output: 'export'`
   - Or use Render's Next.js template (auto-configured)

4. Add Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://cricket-backend.onrender.com/api
   NEXT_PUBLIC_SOCKET_URL=https://cricket-backend.onrender.com
   ```

5. Click **"Create Static Site"**

### 5. Update Backend FRONTEND_URL
Go back to backend service and update `FRONTEND_URL` to your frontend URL

---

## 📋 Option 3: Railway Full Stack

### Deploy Everything on Railway

1. **Database:** Follow Part A, Step 2
2. **Backend:** Follow Part A, Steps 3-7
3. **Frontend:**
   - Click **"New"** → **"GitHub Repo"**
   - Select repository
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables (API_URL, SOCKET_URL)

---

## 🔧 Custom Domain (Optional)

### On Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatic

### On Railway
1. Go to Service Settings → Networking
2. Add custom domain
3. Update DNS CNAME record
4. SSL certificate is automatic

---

## 🔍 Troubleshooting

### Backend Issues

**Database Connection Failed:**
```bash
# Check DATABASE_URL is correct
# Ensure it includes ?schema=public at the end
postgresql://user:pass@host:5432/db?schema=public
```

**Migrations Not Running:**
```bash
# In Railway/Render CLI or locally:
npx prisma migrate deploy
```

**Port Issues:**
```bash
# Ensure PORT variable is set to 5000 or $PORT (Railway auto-assigns)
```

### Frontend Issues

**API Connection Failed:**
```bash
# Check NEXT_PUBLIC_API_URL includes /api
# Example: https://backend.railway.app/api (NOT /api/)
```

**Socket.IO Not Connecting:**
```bash
# Ensure NEXT_PUBLIC_SOCKET_URL does NOT have /api
# Example: https://backend.railway.app
```

**CORS Errors:**
```bash
# Ensure FRONTEND_URL in backend matches your Vercel URL exactly
# No trailing slash!
```

### Database Issues

**Seed Data Not Showing:**
```bash
# Manually run seed:
npx prisma db seed
```

**Reset Database:**
```bash
# WARNING: This deletes all data
npx prisma migrate reset
```

---

## 📊 Monitoring & Logs

### Railway
- Click on service → "Deployments" → View logs
- Real-time logs in "Logs" tab

### Vercel
- Click on deployment → "Functions" tab for serverless logs
- "Deployments" tab for build logs

### Render
- Service dashboard → "Logs" tab
- Real-time streaming logs

---

## 💰 Cost Breakdown

### Free Tier (Recommended for Testing)
- **Vercel:** Free (up to 100GB bandwidth/month)
- **Railway:** $5/month credit (enough for hobby project)
- **Total:** $0-5/month

### Render Free Tier
- **Database:** Free (1GB storage)
- **Web Service:** Free (750 hours/month, sleeps after 15min)
- **Total:** $0/month (with cold starts)

### Paid Options (Production)
- **Railway:** $5-20/month (scales with usage)
- **Vercel Pro:** $20/month (better limits)
- **Render:** $7/month per service + $7/month database

---

## 🎯 Next Steps After Deployment

1. **Test All Features:**
   - Login/Register
   - Create teams
   - Create tournament
   - Schedule matches
   - Live scoring
   - Fantasy cricket

2. **Update README:**
   - Add live demo link
   - Update installation instructions

3. **Monitor Performance:**
   - Check response times
   - Monitor database queries
   - Watch for errors

4. **Set Up Analytics (Optional):**
   - Add Google Analytics
   - Add Sentry for error tracking
   - Add Vercel Analytics

5. **Set Up CI/CD:**
   - Already enabled with GitHub integration!
   - Every push to `main` auto-deploys

---

## 🆘 Support

If you encounter issues:
1. Check deployment logs (Railway/Vercel/Render)
2. Verify all environment variables are correct
3. Test backend health endpoint: `/health`
4. Check CORS configuration in backend

**Common Fixes:**
- Redeploy backend after frontend URL change
- Clear browser cache if seeing old frontend
- Check database connection string format
- Ensure all environment variables are set

---

## ✨ Production Optimizations (Future)

1. **Add Redis Caching** (Railway has Redis add-on)
2. **Enable CDN** (Vercel does this automatically)
3. **Add Database Backups** (Railway/Render offer automatic backups)
4. **Set Up Monitoring** (UptimeRobot, Pingdom)
5. **Add Rate Limiting** (Already in code, just configure)

---

**Your Cricket Management System is now ready for the world! 🏏**

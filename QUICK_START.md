# 🚀 Quick Start Guide

Get your Cricket Management System up and running in 5 minutes!

## Option 1: Docker (Recommended - Fastest)

### Prerequisites
- Docker installed
- Docker Compose installed

### Steps

```bash
# 1. Navigate to project directory
cd cricket-management-system

# 2. Start all services
docker-compose up -d

# 3. Wait for services to start (about 30 seconds)
# Watch the logs
docker-compose logs -f

# 4. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

**That's it!** The database will be automatically seeded with sample data.

### Login Credentials

```
Admin: admin@cricket.com / password123
Scorer: scorer@cricket.com / password123
```

## Option 2: Manual Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### Steps

#### 1. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/cricket_management?schema=public"
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Start server
npm run dev
```

#### 2. Setup Frontend (in new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF

# Start development server
npm run dev
```

#### 3. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/health

## First Time Usage

### 1. Login
Visit http://localhost:3000 and login with:
- Email: `admin@cricket.com`
- Password: `password123`

### 2. Explore Dashboard
You'll see:
- 13 players
- 4 teams
- 1 tournament
- 2 matches (1 completed, 1 live)

### 3. View Live Match
1. Click "Live Match" in navigation
2. See real-time scores
3. Watch ball-by-ball updates

### 4. Check Tournament
1. Click "Tournaments"
2. View "Premier Cricket League 2026"
3. See points table
4. View fixtures

### 5. View Players
1. Click "Players"
2. Browse all players
3. Click any player to see detailed stats

## Sample Data Included

### Users
- 1 Super Admin
- 1 Tournament Admin
- 2 Team Owners
- 1 Scorer

### Teams
- Mumbai Strikers
- Delhi Warriors
- Bangalore Champions
- Chennai Kings

### Players
- 4 Batsmen (including Virat Sharma, Rohit Patel)
- 4 Bowlers (including Jasprit Singh, Pat Cummins)
- 3 All-rounders (including Ben Stokes, Hardik Pandya)
- 2 Wicketkeepers (including MS Dhoni Jr)

### Matches
- 1 Completed match (Mumbai Strikers vs Delhi Warriors)
- 1 Live match (Bangalore Champions vs Chennai Kings)

## Common Commands

### Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Reset everything
docker-compose down -v
docker-compose up -d
```

### Backend

```bash
# Development mode
npm run dev

# Build
npm run build

# Production
npm start

# Prisma Studio (Database GUI)
npm run prisma:studio

# Reset & reseed database
npx prisma migrate reset
```

### Frontend

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 5432 are already in use:

**Docker:**
Edit `docker-compose.yml` and change port mappings:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

**Manual:**
Edit `.env` files to use different ports

### Database Connection Error

1. Ensure PostgreSQL is running
2. Check credentials in `.env`
3. Create database manually:
   ```sql
   CREATE DATABASE cricket_management;
   ```

### Cannot Access Frontend

1. Check if backend is running (http://localhost:5000/health)
2. Check browser console for errors
3. Verify `.env.local` has correct API URLs

### Socket.IO Not Connecting

1. Check CORS settings in backend
2. Verify Socket URL in frontend `.env.local`
3. Check browser console for WebSocket errors

## Next Steps

### As Admin
1. Create more players
2. Create new teams
3. Set up a new tournament
4. Generate fixtures
5. Start matches

### As Scorer
1. Go to a live match
2. Record ball-by-ball scores
3. Complete innings
4. Declare results

### As Viewer
1. Watch live matches
2. View analytics
3. Check points table
4. See player statistics

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cricket.com","password":"password123"}'
```

### Get Players
```bash
curl http://localhost:5000/api/players
```

## Features to Explore

✅ **Live Scoring** - Real-time ball-by-ball updates
✅ **Player Auction** - Live bidding system
✅ **Analytics** - Performance graphs and stats
✅ **Points Table** - Auto-calculated standings
✅ **Match Management** - Complete match lifecycle
✅ **Tournament System** - Full tournament management
✅ **Role-Based Access** - Different user permissions

## Need Help?

1. Check [README.md](README.md) for detailed documentation
2. See [API_REFERENCE.md](API_REFERENCE.md) for API details
3. Review code comments for implementation details

## Production Deployment

For production deployment:

1. **Environment Variables**
   - Change JWT_SECRET to a strong random string
   - Update database credentials
   - Set NODE_ENV=production

2. **Database**
   - Use managed PostgreSQL (AWS RDS, etc.)
   - Set up backups
   - Configure connection pooling

3. **Backend**
   - Deploy to cloud (AWS, Google Cloud, Heroku)
   - Set up load balancer
   - Enable HTTPS

4. **Frontend**
   - Deploy to Vercel or Netlify
   - Configure environment variables
   - Set up CDN

5. **Monitoring**
   - Add error tracking (Sentry)
   - Set up logging
   - Configure alerts

---

**Enjoy your Cricket Management System! 🏏**

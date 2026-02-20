# 🏏 Cricket Match Management System

A comprehensive, production-ready web application for managing cricket tournaments, matches, players, teams, and real-time ball-by-ball scoring with advanced analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Socket.IO Events](#socketio-events)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Test Credentials](#test-credentials)
- [Screenshots](#screenshots)

## ✨ Features

### Core Modules

1. **Player & Hiring Module**
   - Player registration with detailed stats
   - Player roles (Batsman, Bowler, All-rounder, Wicketkeeper)
   - Performance statistics tracking
   - Live auction system with bidding
   - Contract management
   - Budget validation

2. **Team Management**
   - Create and manage teams
   - Team logo and branding
   - Squad management (Playing XI, Bench)
   - Captain & Vice-captain selection
   - Team statistics tracking

3. **Tournament Management**
   - Multiple tournament formats (T20, ODI, Test)
   - League/Knockout/Hybrid formats
   - Auto fixture generation
   - Points table with auto-calculation
   - Net run rate calculation

4. **Match Management**
   - Complete toss system
   - Ball-by-ball scoring engine
   - Live commentary
   - Auto strike rotation
   - Over summary generation
   - Detailed scorecards (batting & bowling)
   - Fall of wickets tracking
   - Partnership analysis

5. **Real-Time Updates**
   - Live score updates via WebSockets
   - Multiple viewer support
   - Real-time auction bidding
   - Instant scorecard refresh

6. **Analytics Module**
   - Player analytics (batting average, strike rate, economy)
   - Match analytics (run rate graphs, powerplay analysis)
   - Team performance metrics
   - Tournament statistics
   - Win probability calculation
   - MVP auto-selection

7. **Result & Reporting**
   - Auto winner declaration
   - Margin calculation
   - Match summary generation
   - Downloadable PDF scorecards
   - Public result pages

8. **Role-Based Access Control**
   - Super Admin
   - Tournament Admin
   - Team Owner
   - Scorer
   - Viewer

9. **Gamification & Engagement**
   - Achievement system with 6 predefined badges (Century, Hat-trick, etc.)
   - Real-time achievement unlock notifications
   - Multiple leaderboards (Runs, Wickets, Strike Rate, Fantasy Points)
   - User XP and level progression system
   - Daily/Weekly/Monthly challenges
   - Fantasy cricket with budget-based team building
   - Private fantasy leagues with join codes
   - Automatic points calculation for fantasy teams

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Authentication**: JWT
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components
- **State Management**: Zustand
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Charts**: Recharts

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose

## 📁 Project Structure

```
cricket-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.IO handlers
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── app/                 # Next.js pages (App Router)
│   ├── components/          # React components
│   ├── lib/                 # API & Socket clients
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── README.md
```

## 🌐 Online Deployment (Zero Cost Model)

Deploy your Cricket Management System online for **$0/month** in just 15 minutes!

### Quick Start:
📖 **[DEPLOYMENT_QUICKSTART.md](./DEPLOYMENT_QUICKSTART.md)** - 15-minute deployment guide

### Detailed Guides:
📚 **[FREE_HOSTING_GUIDE.md](./FREE_HOSTING_GUIDE.md)** - Complete free hosting guide
📚 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - All deployment options

**Recommended Free Stack:**
- Frontend: Vercel (100GB bandwidth/month)
- Backend: Render (Forever free with cold starts)
- Database: Neon (512MB storage)

## 📦 Prerequisites (Local Development)

- Node.js 18+ and npm
- PostgreSQL 14+
- Docker & Docker Compose (optional)

## 🚀 Local Installation

### Method 1: Manual Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd cricket-management-system
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://postgres:password@localhost:5432/cricket_management?schema=public"
# JWT_SECRET=your-secret-key
# PORT=5000

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npm run prisma:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### Method 2: Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health

## 🔑 Test Credentials

```
Super Admin:
Email: admin@cricket.com
Password: password123

Tournament Admin:
Email: tournament@cricket.com
Password: password123

Team Owner:
Email: owner1@cricket.com
Password: password123

Scorer:
Email: scorer@cricket.com
Password: password123
```

## 📡 API Documentation

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile (Protected)
```

### Player Endpoints

```
GET    /api/players
GET    /api/players/:id
POST   /api/players (Admin only)
PUT    /api/players/:id (Admin only)
DELETE /api/players/:id (Admin only)
GET    /api/players/:id/analytics
```

### Team Endpoints

```
GET    /api/teams
GET    /api/teams/:id
POST   /api/teams (Admin/Owner)
PUT    /api/teams/:id (Admin/Owner)
DELETE /api/teams/:id (Admin only)
GET    /api/teams/:id/squad
POST   /api/teams/:id/players (Admin/Owner)
DELETE /api/teams/:id/players/:contractId (Admin/Owner)
```

### Tournament Endpoints

```
GET  /api/tournaments
GET  /api/tournaments/:id
POST /api/tournaments (Admin)
POST /api/tournaments/:id/teams (Admin)
POST /api/tournaments/:id/generate-fixtures (Admin)
GET  /api/tournaments/:id/points-table
```

### Match Endpoints

```
GET  /api/matches
GET  /api/matches/:id
POST /api/matches (Admin)
POST /api/matches/:id/toss (Admin/Scorer)
POST /api/matches/:id/innings (Admin/Scorer)
POST /api/matches/:id/ball (Admin/Scorer)
POST /api/matches/:id/complete-innings (Admin/Scorer)
POST /api/matches/:id/complete (Admin/Scorer)
GET  /api/matches/:id/live
```

### Auction Endpoints

```
GET    /api/auction/available-players
GET    /api/auction/:playerId/bids
GET    /api/auction/:playerId/highest-bid
POST   /api/auction/bid (Owner/Admin)
POST   /api/auction/:playerId/sell (Admin)
DELETE /api/auction/:playerId/reset (Admin)
```

### Analytics Endpoints

```
GET /api/analytics/match/:matchId
GET /api/analytics/player/:playerId
GET /api/analytics/team/:teamId
GET /api/analytics/tournament/:tournamentId
```

## 🔌 Socket.IO Events

### Match Events

**Client → Server:**
```javascript
socket.emit('join-match', matchId)
socket.emit('leave-match', matchId)
socket.emit('record-ball', ballData)
socket.emit('get-live-score', matchId)
```

**Server → Client:**
```javascript
socket.on('score-update', (data) => {})
socket.on('live-score', (data) => {})
socket.on('error', (error) => {})
```

### Auction Events

**Client → Server:**
```javascript
socket.emit('join-auction', auctionId)
socket.emit('leave-auction', auctionId)
socket.emit('place-bid', bidData)
socket.emit('sell-player', playerData)
```

**Server → Client:**
```javascript
socket.on('new-bid', (data) => {})
socket.on('player-sold', (data) => {})
socket.on('bid-error', (error) => {})
```

## 🗄 Database Schema

### Key Tables

- **User**: Authentication and role management
- **Player**: Player profiles and statistics
- **Team**: Team information and budget
- **Contract**: Player-team contracts
- **Tournament**: Tournament configuration
- **TournamentTeam**: Teams in tournaments
- **PointsTable**: Standings and NRR
- **Match**: Match details and results
- **Innings**: Innings-level data
- **Over**: Over-by-over details
- **Ball**: Ball-by-ball records
- **BattingPerformance**: Batting stats
- **BowlingPerformance**: Bowling stats
- **Commentary**: Ball commentary
- **AuctionBid**: Bidding history
- **MatchAnalytics**: Advanced match metrics
- **TeamStats**: Aggregate team statistics

## 👥 User Roles

### SUPER_ADMIN
- Full system access
- Manage all entities
- Delete operations

### TOURNAMENT_ADMIN
- Create/manage tournaments
- Create matches
- Generate fixtures
- Manage teams in tournaments

### TEAM_OWNER
- Create/manage teams
- Participate in auctions
- Manage squad

### SCORER
- Record ball-by-ball data
- Update live matches
- Record toss and results

### VIEWER
- Read-only access
- View matches and statistics

## 🏗 Key Features Implementation

### Ball-by-Ball Scoring Engine

The system records each delivery with:
- Over and ball number
- Batsman and bowler
- Runs scored
- Extras (Wide, No ball, Bye, Leg bye)
- Wicket details (type, fielder)
- Commentary
- Auto strike rotation
- Performance stat updates

### Points Table Calculation

Automatically calculates:
- Matches played, won, lost
- Points (2 per win)
- Net Run Rate (NRR)
- Runs scored/conceded
- Overs played/faced

### Real-Time Features

- WebSocket connections for live updates
- Multiple viewers can watch simultaneously
- Instant scorecard refresh
- Live auction bidding
- Real-time commentary

### Analytics

- Batting average: Total Runs / Dismissals
- Strike rate: (Runs / Balls) × 100
- Bowling average: Runs Conceded / Wickets
- Economy rate: Runs Conceded / Overs
- Net Run Rate: (Run Rate For) - (Run Rate Against)
- Win probability: Custom algorithm based on target, wickets, overs

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

## 🧪 Development

### Backend Development

```bash
cd backend

# Run in watch mode
npm run dev

# Run Prisma Studio (Database GUI)
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/cricket_management
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 🎯 Usage Guide

### 1. Login
- Navigate to http://localhost:3000
- Use test credentials to login

### 2. View Dashboard
- See overview of players, teams, tournaments, matches
- View live match count

### 3. Manage Players
- Navigate to Players page
- View all players with stats
- Create new players (Admin only)

### 4. Manage Teams
- Navigate to Teams page
- Create teams with logo and colors
- View team squads

### 5. Create Tournament
- Navigate to Tournaments page
- Create new tournament
- Add teams to tournament
- Generate fixtures

### 6. Live Scoring
- Navigate to Live Match page
- Select a live match
- View real-time score updates
- See batting and bowling scorecards

### 7. View Analytics
- Click on any match/player/team
- View detailed performance analytics
- See charts and graphs

## 🤝 Contributing

This is a complete demonstration project. For production use, consider:

1. Adding more comprehensive error handling
2. Implementing rate limiting
3. Adding input sanitization
4. Setting up CI/CD pipelines
5. Adding comprehensive test coverage
6. Implementing caching (Redis)
7. Adding monitoring and logging
8. Implementing backup strategies

## 📄 License

MIT License

## 👨‍💻 Author

Sanjay Krishnan JV
Email: sanjaykrishnanjv@gamil.com
Phone: +918547858420
Visit: sanjaykrishnanjv.com
## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Socket.IO for real-time capabilities
- Tailwind CSS for styling
- All open-source contributors

---

**🏏**

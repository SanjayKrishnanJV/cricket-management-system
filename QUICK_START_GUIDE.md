# 🏏 Cricket Management System - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Start the Application
1. Make sure **Docker Desktop** is running
2. Double-click `START-APP.bat` (Windows) or run `docker-compose -f docker-compose.dev.yml up -d`
3. Wait 60-90 seconds for first-time setup
4. Browser will auto-open to http://localhost:3000

### Step 2: Login
```
Email: admin@cricket.com
Password: password123
```

### Step 3: Start Managing Cricket!

---

## ✨ Complete Feature Guide

### 1️⃣ ADD NEW PLAYERS (Fully Dynamic)

**Via Web Interface:**
1. Go to `/dashboard/players`
2. Click "Add Player" button
3. Fill in the form:
   - Name, Age, Nationality
   - Role: Batsman / Bowler / All-Rounder / Wicketkeeper
   - Base Price (for auctions)
   - Image URL (optional)
4. Click "Save"

**Stats Auto-Update During Matches:**
- Batting stats: Runs, balls faced, 4s, 6s, strike rate
- Bowling stats: Overs, runs conceded, wickets, economy
- Career averages calculated automatically

**Via API:**
```bash
curl -X POST http://localhost:5000/api/players \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Virat Kohli",
    "age": 35,
    "nationality": "India",
    "role": "BATSMAN",
    "basePrice": 15000000,
    "imageUrl": "https://example.com/virat.jpg"
  }'
```

---

### 2️⃣ CREATE NEW TEAMS (Fully Dynamic)

**Via Web Interface:**
1. Go to `/dashboard/teams`
2. Click "Add Team" button
3. Fill in:
   - Team Name (e.g., "Mumbai Indians")
   - Short Name (e.g., "MI")
   - Logo URL
   - Primary Color (hex code)
   - Budget (e.g., 100000000 for 10 crore)
4. Click "Save"

**Add Players to Team:**
1. Click on team card
2. Click "Add Player to Squad"
3. Select player from dropdown
4. Enter contract amount
5. Click "Add"

**Via API:**
```bash
# Create Team
curl -X POST http://localhost:5000/api/teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chennai Super Kings",
    "shortName": "CSK",
    "logoUrl": "https://example.com/csk-logo.png",
    "primaryColor": "#FFCC00",
    "budget": 100000000
  }'

# Add Player to Team
curl -X POST http://localhost:5000/api/teams/TEAM_ID/players \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "PLAYER_ID",
    "amount": 5000000
  }'
```

---

### 3️⃣ CREATE TOURNAMENTS (Fully Dynamic)

**Via Web Interface:**
1. Go to `/dashboard/tournaments`
2. Click "Create Tournament"
3. Fill in:
   - Name (e.g., "IPL 2026")
   - Format: T20 / ODI / TEST
   - Type: LEAGUE / KNOCKOUT / LEAGUE_KNOCKOUT
   - Start Date, End Date
   - Prize Pool (optional)
4. Click "Create"

**Add Teams to Tournament:**
1. Click on tournament card
2. Click "Add Teams"
3. Select teams from list
4. Click "Add"

**Generate Fixtures (Auto-magic!):**
1. Click "Generate Fixtures" button
2. System automatically creates:
   - Round-robin matches (for LEAGUE format)
   - Match schedule
   - Points table initialized

**Via API:**
```bash
# Create Tournament
curl -X POST http://localhost:5000/api/tournaments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "IPL 2026",
    "format": "T20",
    "type": "LEAGUE",
    "startDate": "2026-03-15",
    "endDate": "2026-05-30",
    "prizePool": 500000000
  }'

# Add Team to Tournament
curl -X POST http://localhost:5000/api/tournaments/TOURNAMENT_ID/teams \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": "TEAM_ID"
  }'

# Auto-Generate Fixtures
curl -X POST http://localhost:5000/api/tournaments/TOURNAMENT_ID/generate-fixtures \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4️⃣ BALL-BY-BALL SCORING (Fully Dynamic & Real-time)

**Complete Match Flow:**

#### Step 1: Create Match
```bash
curl -X POST http://localhost:5000/api/matches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentId": "TOURNAMENT_ID",
    "teamAId": "TEAM_A_ID",
    "teamBId": "TEAM_B_ID",
    "venue": "Wankhede Stadium, Mumbai",
    "matchDate": "2026-03-20T19:30:00Z"
  }'
```

#### Step 2: Record Toss
```bash
curl -X POST http://localhost:5000/api/matches/MATCH_ID/toss \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tossWinnerId": "TEAM_A_ID",
    "decision": "BAT"
  }'
```

#### Step 3: Start Innings
```bash
curl -X POST http://localhost:5000/api/matches/MATCH_ID/innings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "battingTeamId": "TEAM_A_ID",
    "bowlingTeamId": "TEAM_B_ID",
    "inningsNumber": 1
  }'
```

#### Step 4: Record Each Ball
```bash
# Example: A dot ball
curl -X POST http://localhost:5000/api/matches/MATCH_ID/ball \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inningsId": "INNINGS_ID",
    "overNumber": 1,
    "ballNumber": 1,
    "batsmanId": "BATSMAN_ID",
    "bowlerId": "BOWLER_ID",
    "runs": 0,
    "commentary": "Good length, defended back to the bowler"
  }'

# Example: A boundary
curl -X POST http://localhost:5000/api/matches/MATCH_ID/ball \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inningsId": "INNINGS_ID",
    "overNumber": 1,
    "ballNumber": 2,
    "batsmanId": "BATSMAN_ID",
    "bowlerId": "BOWLER_ID",
    "runs": 4,
    "commentary": "Short ball, pulled to the boundary!"
  }'

# Example: A wicket
curl -X POST http://localhost:5000/api/matches/MATCH_ID/ball \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inningsId": "INNINGS_ID",
    "overNumber": 1,
    "ballNumber": 3,
    "batsmanId": "BATSMAN_ID",
    "bowlerId": "BOWLER_ID",
    "runs": 0,
    "isWicket": true,
    "wicketType": "CAUGHT",
    "dismissedPlayerId": "BATSMAN_ID",
    "wicketTakerId": "BOWLER_ID",
    "fielderId": "FIELDER_ID",
    "commentary": "Edged and caught at slip!"
  }'

# Example: Wide ball
curl -X POST http://localhost:5000/api/matches/MATCH_ID/ball \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inningsId": "INNINGS_ID",
    "overNumber": 1,
    "ballNumber": 4,
    "batsmanId": "BATSMAN_ID",
    "bowlerId": "BOWLER_ID",
    "runs": 1,
    "isExtra": true,
    "extraType": "WIDE",
    "commentary": "Wide down the leg side"
  }'

# Example: Six!
curl -X POST http://localhost:5000/api/matches/MATCH_ID/ball \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inningsId": "INNINGS_ID",
    "overNumber": 1,
    "ballNumber": 5,
    "batsmanId": "BATSMAN_ID",
    "bowlerId": "BOWLER_ID",
    "runs": 6,
    "commentary": "Massive six over long-on!"
  }'
```

**What Happens Automatically:**
- ✅ Batsman stats updated (runs, balls, 4s, 6s, strike rate)
- ✅ Bowler stats updated (overs, runs, wickets, economy)
- ✅ Team score updated
- ✅ Over progression (after 6 legal balls)
- ✅ Innings total calculated
- ✅ Run rate, required rate calculated
- ✅ Win probability calculated
- ✅ **Real-time updates sent to all viewers via Socket.IO**
- ✅ Points table updated after match

---

### 5️⃣ LIVE MATCH VIEWING (Real-time Updates)

**Via Web Interface:**
1. Go to `/dashboard/live`
2. Select a match
3. Watch score update in real-time as balls are recorded
4. See live commentary feed
5. View current partnership, run rate, required rate

**Via Socket.IO (for custom apps):**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join match room
socket.emit('join-match', { matchId: 'MATCH_ID' });

// Listen for score updates
socket.on('score-update', (data) => {
  console.log('New ball recorded:', data);
  // data contains: ball, innings, match, batting, bowling
});

// Get current live score
socket.emit('get-live-score', { matchId: 'MATCH_ID' });
socket.on('live-score', (score) => {
  console.log('Live score:', score);
});
```

---

### 6️⃣ VIEW MATCH SCORECARD

**Via Web Interface:**
1. Go to `/dashboard/matches`
2. Click on any match
3. View complete scorecard:
   - Batting card (runs, balls, 4s, 6s, SR)
   - Bowling card (overs, runs, wickets, economy)
   - Fall of wickets
   - Over summary
   - Match result

**Via API:**
```bash
curl -X GET http://localhost:5000/api/matches/MATCH_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7️⃣ VIEW POINTS TABLE

**Via Web Interface:**
1. Go to `/dashboard/tournaments/TOURNAMENT_ID`
2. View points table with:
   - Matches played, won, lost, tied
   - Points (2 per win)
   - Net Run Rate (NRR)
   - Auto-sorted by points then NRR

**Via API:**
```bash
curl -X GET http://localhost:5000/api/tournaments/TOURNAMENT_ID/points-table \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 8️⃣ PLAYER AUCTION (Live Bidding)

**Via Web Interface:**
1. Go to `/dashboard/auction`
2. See available players
3. Place bids on players
4. System validates budget
5. Highest bidder wins

**Via Socket.IO:**
```javascript
// Join auction room
socket.emit('join-auction');

// Place a bid
socket.emit('place-bid', {
  playerId: 'PLAYER_ID',
  teamId: 'TEAM_ID',
  amount: 5000000
});

// Listen for new bids
socket.on('new-bid', (bid) => {
  console.log('New bid:', bid);
});

// Sell player
socket.emit('sell-player', {
  playerId: 'PLAYER_ID'
});

socket.on('player-sold', (data) => {
  console.log('Player sold:', data);
});
```

---

### 9️⃣ ANALYTICS DASHBOARD

**Via Web Interface:**
1. Go to `/dashboard/analytics`
2. View:
   - Top batsmen (by runs)
   - Top bowlers (by wickets)
   - Team performance charts
   - Match statistics
   - Powerplay analysis
   - Death overs analysis

**Via API:**
```bash
# Player Analytics
curl -X GET http://localhost:5000/api/analytics/player/PLAYER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Match Analytics
curl -X GET http://localhost:5000/api/analytics/match/MATCH_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Team Analytics
curl -X GET http://localhost:5000/api/analytics/team/TEAM_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Tournament Analytics
curl -X GET http://localhost:5000/api/analytics/tournament/TOURNAMENT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 Example: Complete Tournament Setup

Here's a complete example to set up a tournament from scratch:

### 1. Create 4 Players
```bash
# Create Batsman
curl -X POST http://localhost:5000/api/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Rohit Sharma", "age": 36, "nationality": "India", "role": "BATSMAN", "basePrice": 12000000}'

# Create Bowler
curl -X POST http://localhost:5000/api/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Jasprit Bumrah", "age": 30, "nationality": "India", "role": "BOWLER", "basePrice": 15000000}'

# Create All-Rounder
curl -X POST http://localhost:5000/api/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hardik Pandya", "age": 30, "nationality": "India", "role": "ALL_ROUNDER", "basePrice": 13000000}'

# Create Wicketkeeper
curl -X POST http://localhost:5000/api/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Rishabh Pant", "age": 26, "nationality": "India", "role": "WICKETKEEPER", "basePrice": 11000000}'
```

### 2. Create 2 Teams
```bash
# Create Team A
curl -X POST http://localhost:5000/api/teams \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mumbai Indians", "shortName": "MI", "logoUrl": "https://example.com/mi.png", "primaryColor": "#004BA0", "budget": 100000000}'

# Create Team B
curl -X POST http://localhost:5000/api/teams \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Chennai Super Kings", "shortName": "CSK", "logoUrl": "https://example.com/csk.png", "primaryColor": "#FFCC00", "budget": 100000000}'
```

### 3. Assign Players to Teams
```bash
# Add Rohit to MI
curl -X POST http://localhost:5000/api/teams/MI_TEAM_ID/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"playerId": "ROHIT_ID", "amount": 12000000}'

# Add Jasprit to MI
curl -X POST http://localhost:5000/api/teams/MI_TEAM_ID/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"playerId": "BUMRAH_ID", "amount": 15000000}'

# Add Hardik to CSK
curl -X POST http://localhost:5000/api/teams/CSK_TEAM_ID/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"playerId": "HARDIK_ID", "amount": 13000000}'

# Add Pant to CSK
curl -X POST http://localhost:5000/api/teams/CSK_TEAM_ID/players \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"playerId": "PANT_ID", "amount": 11000000}'
```

### 4. Create Tournament
```bash
curl -X POST http://localhost:5000/api/tournaments \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mini IPL 2026", "format": "T20", "type": "LEAGUE", "startDate": "2026-03-15", "endDate": "2026-03-20", "prizePool": 10000000}'
```

### 5. Add Teams to Tournament
```bash
# Add MI
curl -X POST http://localhost:5000/api/tournaments/TOURNAMENT_ID/teams \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"teamId": "MI_TEAM_ID"}'

# Add CSK
curl -X POST http://localhost:5000/api/tournaments/TOURNAMENT_ID/teams \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"teamId": "CSK_TEAM_ID"}'
```

### 6. Generate Fixtures
```bash
curl -X POST http://localhost:5000/api/tournaments/TOURNAMENT_ID/generate-fixtures \
  -H "Authorization: Bearer YOUR_JWT"
```

### 7. Play Match (Ball-by-Ball)
```bash
# 1. Record Toss
curl -X POST http://localhost:5000/api/matches/MATCH_ID/toss \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"tossWinnerId": "MI_TEAM_ID", "decision": "BAT"}'

# 2. Start Innings
curl -X POST http://localhost:5000/api/matches/MATCH_ID/innings \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"battingTeamId": "MI_TEAM_ID", "bowlingTeamId": "CSK_TEAM_ID", "inningsNumber": 1}'

# 3. Record balls (repeat for each ball)
# Over 1, Ball 1 - Dot ball
curl -X POST http://localhost:5000/api/matches/MATCH_ID/ball \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"inningsId": "INNINGS_ID", "overNumber": 1, "ballNumber": 1, "batsmanId": "ROHIT_ID", "bowlerId": "HARDIK_ID", "runs": 0, "commentary": "Good start"}'

# Over 1, Ball 2 - 4 runs
curl -X POST http://localhost:5000/api/matches/MATCH_ID/ball \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"inningsId": "INNINGS_ID", "overNumber": 1, "ballNumber": 2, "batsmanId": "ROHIT_ID", "bowlerId": "HARDIK_ID", "runs": 4, "commentary": "Beautiful cover drive!"}'

# ... continue for all balls
```

---

## 🔧 Troubleshooting

### Docker Not Running
```
ERROR: Docker is not running!
```
**Fix:** Start Docker Desktop from Start Menu

### Port Already in Use
```
ERROR: Port 3000/5000/5432 already in use
```
**Fix:**
```bash
# Stop the application
docker-compose -f docker-compose.dev.yml down

# Check what's using the port
netstat -ano | findstr :3000

# Kill the process or change ports in docker-compose.dev.yml
```

### Database Connection Failed
```bash
# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs
```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs -f

# View specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f postgres
```

---

## 📚 Additional Resources

- **Full API Documentation**: See [API_REFERENCE.md](API_REFERENCE.md)
- **Database Schema**: See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **Architecture**: See [README.md](README.md)

---

## 🎉 You're All Set!

Your cricket management system is **fully dynamic** and ready to use. You can:
- ✅ Add unlimited players
- ✅ Create unlimited teams
- ✅ Organize unlimited tournaments
- ✅ Record every ball of every match
- ✅ Watch live updates in real-time
- ✅ Run auctions
- ✅ View comprehensive analytics

**Everything updates automatically!** 🚀

---

## 💡 Pro Tips

1. **Use the Web Interface** for quick setup and testing
2. **Use the API** for automation and integration
3. **Use Socket.IO** for real-time features in your apps
4. **Check the database** directly if you want to see the data:
   ```bash
   docker exec -it cricket-postgres psql -U postgres -d cricket_management
   # Then run: \dt (to list tables)
   # SELECT * FROM "Player"; (to query players)
   ```

5. **Seed data is included** - The system comes with sample players and teams to test with!

Happy Cricket Managing! 🏏

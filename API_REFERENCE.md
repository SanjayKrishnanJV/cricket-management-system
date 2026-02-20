# API Reference Guide

## Complete API Endpoints List

### Authentication
| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/api/auth/register` | No | - | Register new user |
| POST | `/api/auth/login` | No | - | Login user |
| GET | `/api/auth/profile` | Yes | All | Get current user profile |

### Players
| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/players` | No | - | Get all players |
| GET | `/api/players/:id` | No | - | Get player by ID |
| GET | `/api/players/:id/analytics` | No | - | Get player analytics |
| POST | `/api/players` | Yes | Admin | Create new player |
| PUT | `/api/players/:id` | Yes | Admin | Update player |
| DELETE | `/api/players/:id` | Yes | Super Admin | Delete player |

### Teams
| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/teams` | No | - | Get all teams |
| GET | `/api/teams/:id` | No | - | Get team by ID |
| GET | `/api/teams/:id/squad` | No | - | Get team squad |
| POST | `/api/teams` | Yes | Admin/Owner | Create new team |
| PUT | `/api/teams/:id` | Yes | Admin/Owner | Update team |
| DELETE | `/api/teams/:id` | Yes | Super Admin | Delete team |
| POST | `/api/teams/:id/players` | Yes | Admin/Owner | Add player to team |
| DELETE | `/api/teams/:id/players/:contractId` | Yes | Admin/Owner | Remove player from team |

### Tournaments
| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/tournaments` | No | - | Get all tournaments |
| GET | `/api/tournaments/:id` | No | - | Get tournament by ID |
| GET | `/api/tournaments/:id/points-table` | No | - | Get points table |
| POST | `/api/tournaments` | Yes | Admin | Create tournament |
| POST | `/api/tournaments/:id/teams` | Yes | Admin | Add team to tournament |
| POST | `/api/tournaments/:id/generate-fixtures` | Yes | Admin | Generate match fixtures |

### Matches
| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/matches` | No | - | Get all matches |
| GET | `/api/matches/:id` | No | - | Get match by ID |
| GET | `/api/matches/:id/live` | No | - | Get live score |
| POST | `/api/matches` | Yes | Admin | Create match |
| POST | `/api/matches/:id/toss` | Yes | Admin/Scorer | Record toss |
| POST | `/api/matches/:id/innings` | Yes | Admin/Scorer | Start innings |
| POST | `/api/matches/:id/ball` | Yes | Admin/Scorer | Record ball |
| POST | `/api/matches/:id/complete-innings` | Yes | Admin/Scorer | Complete innings |
| POST | `/api/matches/:id/complete` | Yes | Admin/Scorer | Complete match |

### Auction
| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/auction/available-players` | No | - | Get available players |
| GET | `/api/auction/:playerId/bids` | No | - | Get current bids |
| GET | `/api/auction/:playerId/highest-bid` | No | - | Get highest bid |
| POST | `/api/auction/bid` | Yes | Owner/Admin | Place bid |
| POST | `/api/auction/:playerId/sell` | Yes | Admin | Sell player |
| DELETE | `/api/auction/:playerId/reset` | Yes | Super Admin | Reset auction |

### Analytics
| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/api/analytics/match/:matchId` | No | - | Get match analytics |
| GET | `/api/analytics/player/:playerId` | No | - | Get player analytics |
| GET | `/api/analytics/team/:teamId` | No | - | Get team analytics |
| GET | `/api/analytics/tournament/:tournamentId` | No | - | Get tournament analytics |

## Request/Response Examples

### 1. Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "VIEWER"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "VIEWER"
    },
    "token": "jwt-token"
  }
}
```

### 2. Create Player
```bash
POST /api/players
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Virat Sharma",
  "role": "BATSMAN",
  "age": 28,
  "nationality": "India",
  "basePrice": 2000000,
  "imageUrl": "https://example.com/image.jpg"
}
```

### 3. Create Tournament
```bash
POST /api/tournaments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Premier Cricket League 2026",
  "format": "T20",
  "type": "LEAGUE",
  "startDate": "2026-03-01",
  "endDate": "2026-05-31",
  "prizePool": 50000000,
  "description": "The biggest T20 cricket tournament"
}
```

### 4. Record Ball
```bash
POST /api/matches/:matchId/ball
Authorization: Bearer <token>
Content-Type: application/json

{
  "inningsId": "uuid",
  "bowlerId": "uuid",
  "batsmanId": "uuid",
  "runs": 4,
  "isWicket": false,
  "isExtra": false,
  "extraRuns": 0,
  "commentary": "Beautifully driven through covers for FOUR!"
}
```

### 5. Record Wicket Ball
```bash
POST /api/matches/:matchId/ball
Authorization: Bearer <token>
Content-Type: application/json

{
  "inningsId": "uuid",
  "bowlerId": "uuid",
  "batsmanId": "uuid",
  "runs": 0,
  "isWicket": true,
  "wicketType": "CAUGHT",
  "dismissedPlayerId": "uuid",
  "wicketTakerId": "uuid",
  "isExtra": false,
  "commentary": "WICKET! Caught at mid-off!"
}
```

## Socket.IO Events Reference

### Connect to Socket
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected');
});
```

### Join Match Room
```javascript
socket.emit('join-match', matchId);
```

### Listen for Score Updates
```javascript
socket.on('score-update', (data) => {
  console.log('New ball:', data.ball);
  console.log('Live score:', data.liveScore);
});
```

### Record Ball (From Scorer)
```javascript
socket.emit('record-ball', {
  matchId: 'uuid',
  inningsId: 'uuid',
  bowlerId: 'uuid',
  batsmanId: 'uuid',
  ballData: {
    runs: 4,
    isWicket: false,
    isExtra: false,
    extraRuns: 0,
    commentary: 'FOUR!'
  }
});
```

### Join Auction
```javascript
socket.emit('join-auction', auctionId);
```

### Place Bid
```javascript
socket.emit('place-bid', {
  auctionId: 'uuid',
  playerId: 'uuid',
  bidderId: 'uuid',
  amount: 2500000
});
```

### Listen for New Bids
```javascript
socket.on('new-bid', (data) => {
  console.log('New bid:', data.bid);
  console.log('For player:', data.playerId);
});
```

### Listen for Player Sold
```javascript
socket.on('player-sold', (data) => {
  console.log('Player sold:', data.result);
});
```

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Query Parameters

### Get All Matches
```
GET /api/matches?tournamentId=uuid&teamId=uuid&status=LIVE
```

### Get All Players
```
GET /api/players?role=BATSMAN&nationality=India
```

## Pagination (Future Enhancement)

While not currently implemented, pagination can be added:

```
GET /api/players?page=1&limit=20
```

## Rate Limiting (Future Enhancement)

Consider implementing rate limiting for production:
- 100 requests per 15 minutes per IP
- 1000 requests per hour for authenticated users

## Webhook Events (Future Enhancement)

Future webhook support for:
- Match completion
- Player sold in auction
- Tournament completion
- New high score

## Best Practices

1. **Always include Authorization header for protected routes**
   ```
   Authorization: Bearer <your-jwt-token>
   ```

2. **Handle errors gracefully**
   ```javascript
   try {
     const response = await api.post('/api/players', data);
   } catch (error) {
     console.error(error.response?.data?.message);
   }
   ```

3. **Use Socket.IO for real-time features**
   - Match scoring
   - Auction bidding
   - Live updates

4. **Validate data on client before sending**
   - Reduces server load
   - Better user experience

5. **Cache static data**
   - Player lists
   - Team data
   - Tournament fixtures

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cricket.com","password":"password123"}'

# Get players (with token)
curl -X GET http://localhost:5000/api/players \
  -H "Authorization: Bearer <token>"

# Create player
curl -X POST http://localhost:5000/api/players \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Player","role":"BATSMAN","age":25,"nationality":"India","basePrice":1000000}'
```

### Using Postman

1. Import collection from API documentation
2. Set environment variable for `baseUrl` and `token`
3. Use collections for organized testing

## Production Considerations

1. **Security**
   - Use HTTPS only
   - Implement rate limiting
   - Add request validation
   - Sanitize inputs
   - Use helmet.js

2. **Performance**
   - Add Redis caching
   - Implement pagination
   - Use database indexes
   - Enable compression

3. **Monitoring**
   - Add logging (Winston)
   - Error tracking (Sentry)
   - Performance monitoring
   - Database query analysis

4. **Scaling**
   - Load balancing
   - Database replication
   - CDN for static assets
   - Horizontal scaling

---

For more information, see the main [README.md](README.md)

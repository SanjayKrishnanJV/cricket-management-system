import express, { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { setupMatchSocket } from './sockets/match.socket';
import redisClient from './config/redis';
import prisma from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import playerRoutes from './routes/player.routes';
import teamRoutes from './routes/team.routes';
import tournamentRoutes from './routes/tournament.routes';
import matchRoutes from './routes/match.routes';
import auctionRoutes from './routes/auction.routes';
import analyticsRoutes from './routes/analytics.routes';
import featuresRoutes from './routes/features.routes';
import roleRoutes from './routes/role.routes';
import pollRoutes from './routes/poll.routes';
import winPredictorRoutes from './routes/winPredictor.routes';
import socialRoutes from './routes/social.routes';
import aiRoutes from './routes/ai.routes';
import broadcastRoutes from './routes/broadcast.routes';
import administrationRoutes from './routes/administration.routes';
import calendarRoutes from './routes/calendar.routes';
import achievementRoutes from './routes/achievement.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import rewardsRoutes from './routes/rewards.routes';
import challengeRoutes from './routes/challenge.routes';
import fantasyRoutes from './routes/fantasy.routes';
import contactRoutes from './routes/contact.routes';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, ...process.env.FRONTEND_URL.split(',').filter(Boolean)]
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007'];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Enable Redis adapter for distributed Socket.IO (required for PM2 clustering)
if (redisClient) {
  const pubClient = redisClient;
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));
  console.log('✅ Socket.IO Redis adapter enabled for clustering');
}

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for load balancers
app.get('/health', async (_req, res) => {
  try {
    // Check database connection
    const dbHealthy = await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection
    const redisHealthy = redisClient ? await redisClient.ping() === 'PONG' : true;

    const health = {
      status: 'ok',
      uptime: process.uptime(),
      pid: process.pid,
      memory: process.memoryUsage(),
      database: !!dbHealthy,
      redis: redisHealthy,
      redisEnabled: !!redisClient,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service unhealthy',
      timestamp: new Date().toISOString(),
    });
  }
});

// Kubernetes readiness probe
app.get('/ready', async (_req, res) => {
  try {
    // Check if database is ready
    const ready = await prisma.$queryRaw`SELECT 1`;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: 'Database not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/features', featuresRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api', winPredictorRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/administration', administrationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/fantasy', fantasyRoutes);
app.use('/api/contact', contactRoutes);

// Error handling
app.use(errorHandler);

// Setup Socket.IO
setupMatchSocket(io);

// Initialize gamification cron jobs
import './jobs/gamification.jobs';

// Start server
httpServer.listen(PORT, () => {
  console.log(`
    🏏 Cricket Management System Backend
    =====================================
    🚀 Server running on port ${PORT}
    📡 Socket.IO enabled
    🌍 Environment: ${process.env.NODE_ENV || 'development'}
    💾 Process ID: ${process.pid}
    ⏰ Started at: ${new Date().toISOString()}
    =====================================
  `);
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);

  // Close HTTP server (stop accepting new connections)
  httpServer.close(async () => {
    console.log('✅ HTTP server closed');

    // Close Socket.IO connections
    io.close(() => {
      console.log('✅ Socket.IO connections closed');
    });

    // Disconnect from database
    await prisma.$disconnect();
    console.log('✅ Database disconnected');

    // Close Redis connection
    if (redisClient) {
      await redisClient.quit();
      console.log('✅ Redis disconnected');
    }

    console.log('✅ Cleanup complete, exiting process');
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('⚠️  Forceful shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('message', (msg) => {
  if (msg === 'shutdown') {
    gracefulShutdown('PM2 shutdown');
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export { app, io };

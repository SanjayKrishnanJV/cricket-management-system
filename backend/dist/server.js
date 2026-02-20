"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const match_socket_1 = require("./sockets/match.socket");
const redis_1 = __importDefault(require("./config/redis"));
const database_1 = __importDefault(require("./config/database"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const player_routes_1 = __importDefault(require("./routes/player.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const tournament_routes_1 = __importDefault(require("./routes/tournament.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const auction_routes_1 = __importDefault(require("./routes/auction.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const features_routes_1 = __importDefault(require("./routes/features.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const poll_routes_1 = __importDefault(require("./routes/poll.routes"));
const winPredictor_routes_1 = __importDefault(require("./routes/winPredictor.routes"));
const social_routes_1 = __importDefault(require("./routes/social.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const broadcast_routes_1 = __importDefault(require("./routes/broadcast.routes"));
const administration_routes_1 = __importDefault(require("./routes/administration.routes"));
const calendar_routes_1 = __importDefault(require("./routes/calendar.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
exports.io = io;
if (redis_1.default) {
    const pubClient = redis_1.default;
    const subClient = pubClient.duplicate();
    io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    console.log('✅ Socket.IO Redis adapter enabled for clustering');
}
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3007'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', async (_req, res) => {
    try {
        const dbHealthy = await database_1.default.$queryRaw `SELECT 1`;
        const redisHealthy = redis_1.default ? await redis_1.default.ping() === 'PONG' : true;
        const health = {
            status: 'ok',
            uptime: process.uptime(),
            pid: process.pid,
            memory: process.memoryUsage(),
            database: !!dbHealthy,
            redis: redisHealthy,
            redisEnabled: !!redis_1.default,
            timestamp: new Date().toISOString(),
        };
        res.status(200).json(health);
    }
    catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Service unhealthy',
            timestamp: new Date().toISOString(),
        });
    }
});
app.get('/ready', async (_req, res) => {
    try {
        const ready = await database_1.default.$queryRaw `SELECT 1`;
        res.status(ready ? 200 : 503).json({
            status: ready ? 'ready' : 'not ready',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'not ready',
            error: 'Database not ready',
            timestamp: new Date().toISOString(),
        });
    }
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/players', player_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/tournaments', tournament_routes_1.default);
app.use('/api/matches', match_routes_1.default);
app.use('/api/auction', auction_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/features', features_routes_1.default);
app.use('/api/roles', role_routes_1.default);
app.use('/api/polls', poll_routes_1.default);
app.use('/api', winPredictor_routes_1.default);
app.use('/api/social', social_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/broadcast', broadcast_routes_1.default);
app.use('/api/administration', administration_routes_1.default);
app.use('/api/calendar', calendar_routes_1.default);
app.use(errorHandler_1.errorHandler);
(0, match_socket_1.setupMatchSocket)(io);
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
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
    httpServer.close(async () => {
        console.log('✅ HTTP server closed');
        io.close(() => {
            console.log('✅ Socket.IO connections closed');
        });
        await database_1.default.$disconnect();
        console.log('✅ Database disconnected');
        if (redis_1.default) {
            await redis_1.default.quit();
            console.log('✅ Redis disconnected');
        }
        console.log('✅ Cleanup complete, exiting process');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('⚠️  Forceful shutdown after timeout');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('message', (msg) => {
    if (msg === 'shutdown') {
        gracefulShutdown('PM2 shutdown');
    }
});
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
//# sourceMappingURL=server.js.map
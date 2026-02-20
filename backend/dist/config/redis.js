"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redisEnabled = process.env.REDIS_ENABLED === 'true';
let redisClient = null;
if (redisEnabled) {
    redisClient = new ioredis_1.default({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3,
    });
    redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
    });
    redisClient.on('ready', () => {
        console.log('✅ Redis ready to accept commands');
    });
    redisClient.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
    });
    redisClient.on('close', () => {
        console.log('⚠️  Redis connection closed');
    });
    redisClient.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
    });
}
else {
    console.log('ℹ️  Redis is disabled (graceful degradation mode)');
}
exports.default = redisClient;
//# sourceMappingURL=redis.js.map
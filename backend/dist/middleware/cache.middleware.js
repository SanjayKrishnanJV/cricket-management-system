"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheKeyGenerators = exports.invalidateCacheMiddleware = exports.cacheMiddleware = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const cache_service_1 = require("../services/cache.service");
const cacheMiddleware = (ttl, keyGenerator) => {
    return async (req, res, next) => {
        if (!redis_1.default) {
            return next();
        }
        if (req.method !== 'GET') {
            return next();
        }
        try {
            const cacheKey = keyGenerator ? keyGenerator(req) : req.originalUrl;
            const cachedData = await cache_service_1.cacheService.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }
            const originalJson = res.json.bind(res);
            res.json = function (body) {
                cache_service_1.cacheService.set(cacheKey, JSON.stringify(body), ttl).catch((error) => {
                    console.error(`Failed to cache response for key "${cacheKey}":`, error);
                });
                return originalJson(body);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
const invalidateCacheMiddleware = (invalidator) => {
    return async (req, res, next) => {
        if (!redis_1.default) {
            return next();
        }
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    await invalidator(req);
                }
                catch (error) {
                    console.error('Cache invalidation error:', error);
                }
            }
        });
        next();
    };
};
exports.invalidateCacheMiddleware = invalidateCacheMiddleware;
exports.cacheKeyGenerators = {
    match: (req) => `match:${req.params.id}:details`,
    liveMatch: (req) => `live:match:${req.params.id}`,
    allLiveMatches: () => 'live:matches',
    scorecard: (req) => `match:${req.params.id}:scorecard`,
    playerStats: (req) => `player:${req.params.id}:stats`,
    teamStats: (req) => `team:${req.params.id}:stats`,
    tournamentStandings: (req) => `tournament:${req.params.id}:standings`,
    matchAnalytics: (req) => `analytics:match:${req.params.id}`,
};
//# sourceMappingURL=cache.middleware.js.map
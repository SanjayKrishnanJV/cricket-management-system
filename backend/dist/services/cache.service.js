"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
const redis_1 = __importDefault(require("../config/redis"));
class CacheService {
    async get(key) {
        if (!redis_1.default)
            return null;
        try {
            return await redis_1.default.get(key);
        }
        catch (error) {
            console.error(`Cache GET error for key "${key}":`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        if (!redis_1.default)
            return false;
        try {
            await redis_1.default.setex(key, ttl, value);
            return true;
        }
        catch (error) {
            console.error(`Cache SET error for key "${key}":`, error);
            return false;
        }
    }
    async delete(key) {
        if (!redis_1.default)
            return false;
        try {
            await redis_1.default.del(key);
            return true;
        }
        catch (error) {
            console.error(`Cache DELETE error for key "${key}":`, error);
            return false;
        }
    }
    async deletePattern(pattern) {
        if (!redis_1.default)
            return 0;
        try {
            const keys = await redis_1.default.keys(pattern);
            if (keys.length === 0)
                return 0;
            await redis_1.default.del(...keys);
            return keys.length;
        }
        catch (error) {
            console.error(`Cache DELETE PATTERN error for pattern "${pattern}":`, error);
            return 0;
        }
    }
    async flushAll() {
        if (!redis_1.default)
            return false;
        try {
            await redis_1.default.flushdb();
            console.log('✅ All cache cleared');
            return true;
        }
        catch (error) {
            console.error('Cache FLUSH error:', error);
            return false;
        }
    }
    async invalidateMatch(matchId) {
        if (!redis_1.default)
            return;
        try {
            const patterns = [
                `live:match:${matchId}`,
                `match:${matchId}:*`,
                `analytics:match:${matchId}*`,
                `pdf:scorecard:${matchId}`,
                'live:matches',
            ];
            for (const pattern of patterns) {
                if (pattern.includes('*')) {
                    await this.deletePattern(pattern);
                }
                else {
                    await this.delete(pattern);
                }
            }
            console.log(`🗑️  Invalidated caches for match: ${matchId}`);
        }
        catch (error) {
            console.error(`Error invalidating match cache for ${matchId}:`, error);
        }
    }
    async invalidatePlayer(playerId) {
        if (!redis_1.default)
            return;
        try {
            const patterns = [
                `player:${playerId}:*`,
            ];
            for (const pattern of patterns) {
                await this.deletePattern(pattern);
            }
            console.log(`🗑️  Invalidated caches for player: ${playerId}`);
        }
        catch (error) {
            console.error(`Error invalidating player cache for ${playerId}:`, error);
        }
    }
    async invalidateTournament(tournamentId) {
        if (!redis_1.default)
            return;
        try {
            const patterns = [
                `tournament:${tournamentId}:*`,
            ];
            for (const pattern of patterns) {
                await this.deletePattern(pattern);
            }
            console.log(`🗑️  Invalidated caches for tournament: ${tournamentId}`);
        }
        catch (error) {
            console.error(`Error invalidating tournament cache for ${tournamentId}:`, error);
        }
    }
    async invalidateTeam(teamId) {
        if (!redis_1.default)
            return;
        try {
            const patterns = [
                `team:${teamId}:*`,
            ];
            for (const pattern of patterns) {
                await this.deletePattern(pattern);
            }
            console.log(`🗑️  Invalidated caches for team: ${teamId}`);
        }
        catch (error) {
            console.error(`Error invalidating team cache for ${teamId}:`, error);
        }
    }
    async getStats() {
        if (!redis_1.default) {
            return { enabled: false };
        }
        try {
            const info = await redis_1.default.info('stats');
            const keyspace = await redis_1.default.info('keyspace');
            const memory = await redis_1.default.info('memory');
            return {
                enabled: true,
                stats: info,
                keyspace,
                memory,
            };
        }
        catch (error) {
            console.error('Error getting cache stats:', error);
            return { enabled: true, error: 'Failed to get stats' };
        }
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
//# sourceMappingURL=cache.service.js.map
import redisClient from '../config/redis';

/**
 * Cache Service
 * Provides caching functionality with Redis backend and graceful degradation
 */
export class CacheService {
  /**
   * Get value from cache
   */
  async get(key: string): Promise<string | null> {
    if (!redisClient) return null;

    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error(`Cache GET error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  async set(key: string, value: string, ttl: number): Promise<boolean> {
    if (!redisClient) return false;

    try {
      await redisClient.setex(key, ttl, value);
      return true;
    } catch (error) {
      console.error(`Cache SET error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete single key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!redisClient) return false;

    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DELETE error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * Pattern examples: "match:*", "player:abc-123:*"
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!redisClient) return 0;

    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length === 0) return 0;

      await redisClient.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache DELETE PATTERN error for pattern "${pattern}":`, error);
      return 0;
    }
  }

  /**
   * Clear all cache keys
   */
  async flushAll(): Promise<boolean> {
    if (!redisClient) return false;

    try {
      await redisClient.flushdb();
      console.log('✅ All cache cleared');
      return true;
    } catch (error) {
      console.error('Cache FLUSH error:', error);
      return false;
    }
  }

  // ===== DOMAIN-SPECIFIC INVALIDATORS =====

  /**
   * Invalidate all match-related caches
   */
  async invalidateMatch(matchId: string): Promise<void> {
    if (!redisClient) return;

    try {
      const patterns = [
        `live:match:${matchId}`,           // Live score
        `match:${matchId}:*`,              // All match details
        `analytics:match:${matchId}*`,     // Match analytics
        `pdf:scorecard:${matchId}`,        // PDF scorecard
        'live:matches',                    // All live matches list
      ];

      for (const pattern of patterns) {
        if (pattern.includes('*')) {
          await this.deletePattern(pattern);
        } else {
          await this.delete(pattern);
        }
      }

      console.log(`🗑️  Invalidated caches for match: ${matchId}`);
    } catch (error) {
      console.error(`Error invalidating match cache for ${matchId}:`, error);
    }
  }

  /**
   * Invalidate all player-related caches
   */
  async invalidatePlayer(playerId: string): Promise<void> {
    if (!redisClient) return;

    try {
      const patterns = [
        `player:${playerId}:*`,           // All player details
      ];

      for (const pattern of patterns) {
        await this.deletePattern(pattern);
      }

      console.log(`🗑️  Invalidated caches for player: ${playerId}`);
    } catch (error) {
      console.error(`Error invalidating player cache for ${playerId}:`, error);
    }
  }

  /**
   * Invalidate all tournament-related caches
   */
  async invalidateTournament(tournamentId: string): Promise<void> {
    if (!redisClient) return;

    try {
      const patterns = [
        `tournament:${tournamentId}:*`,   // All tournament details
      ];

      for (const pattern of patterns) {
        await this.deletePattern(pattern);
      }

      console.log(`🗑️  Invalidated caches for tournament: ${tournamentId}`);
    } catch (error) {
      console.error(`Error invalidating tournament cache for ${tournamentId}:`, error);
    }
  }

  /**
   * Invalidate all team-related caches
   */
  async invalidateTeam(teamId: string): Promise<void> {
    if (!redisClient) return;

    try {
      const patterns = [
        `team:${teamId}:*`,               // All team details
      ];

      for (const pattern of patterns) {
        await this.deletePattern(pattern);
      }

      console.log(`🗑️  Invalidated caches for team: ${teamId}`);
    } catch (error) {
      console.error(`Error invalidating team cache for ${teamId}:`, error);
    }
  }

  /**
   * Get cache statistics (if Redis is enabled)
   */
  async getStats(): Promise<any> {
    if (!redisClient) {
      return { enabled: false };
    }

    try {
      const info = await redisClient.info('stats');
      const keyspace = await redisClient.info('keyspace');
      const memory = await redisClient.info('memory');

      return {
        enabled: true,
        stats: info,
        keyspace,
        memory,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { enabled: true, error: 'Failed to get stats' };
    }
  }
}

export const cacheService = new CacheService();

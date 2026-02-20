import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import { cacheService } from '../services/cache.service';

/**
 * Cache Middleware
 * Caches GET responses in Redis with configurable TTL
 *
 * @param ttl - Time to live in seconds
 * @param keyGenerator - Optional function to generate cache key from request
 */
export const cacheMiddleware = (ttl: number, keyGenerator?: (req: Request) => string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if Redis is disabled
    if (!redisClient) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator ? keyGenerator(req) : req.originalUrl;

      // Check cache
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        // Cache hit - return cached response
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Cache miss - override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function (body: any) {
        // Cache the response (fire and forget)
        cacheService.set(cacheKey, JSON.stringify(body), ttl).catch((error) => {
          console.error(`Failed to cache response for key "${cacheKey}":`, error);
        });

        // Send the response
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // On error, skip caching and proceed normally
      next();
    }
  };
};

/**
 * Cache Invalidation Middleware
 * Invalidates cache after successful mutations (POST/PUT/DELETE)
 *
 * @param invalidator - Async function to invalidate cache based on request
 */
export const invalidateCacheMiddleware = (invalidator: (req: Request) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip if Redis is disabled
    if (!redisClient) {
      return next();
    }

    // Hook into response finish event
    res.on('finish', async () => {
      // Only invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await invalidator(req);
        } catch (error) {
          console.error('Cache invalidation error:', error);
          // Don't throw - invalidation failure shouldn't affect response
        }
      }
    });

    next();
  };
};

/**
 * Cache key generators for common patterns
 */
export const cacheKeyGenerators = {
  /**
   * Match-specific cache key
   */
  match: (req: Request) => `match:${req.params.id}:details`,

  /**
   * Live match cache key
   */
  liveMatch: (req: Request) => `live:match:${req.params.id}`,

  /**
   * All live matches cache key
   */
  allLiveMatches: () => 'live:matches',

  /**
   * Match scorecard cache key
   */
  scorecard: (req: Request) => `match:${req.params.id}:scorecard`,

  /**
   * Player stats cache key
   */
  playerStats: (req: Request) => `player:${req.params.id}:stats`,

  /**
   * Team stats cache key
   */
  teamStats: (req: Request) => `team:${req.params.id}:stats`,

  /**
   * Tournament standings cache key
   */
  tournamentStandings: (req: Request) => `tournament:${req.params.id}:standings`,

  /**
   * Match analytics cache key
   */
  matchAnalytics: (req: Request) => `analytics:match:${req.params.id}`,
};

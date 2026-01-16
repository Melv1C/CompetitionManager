import { getRedisClient } from '@/lib/redis';
import { zValidator } from '@hono/zod-validator';
import { Athlete$ } from '@repo/utils';
import { Hono } from 'hono';
import z from 'zod';

const CACHE_KEY_PREFIX = 'athlete-performances:';

// DELETE /athletes/:license/performances/cache - Invalidate performance cache
export const deletePerformanceCacheRouter = new Hono().delete(
  '/:license/performances/cache',
  zValidator(
    'param',
    z.object({
      license: Athlete$.shape.license,
    }),
  ),
  async c => {
    const { license } = c.req.valid('param');
    const redis = getRedisClient();
    if (!redis) {
      c.get('logStep').error('Redis client not available, cannot invalidate cache');
      throw new Error('Redis client not available');
    }

    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${license}`;
      await redis.del(cacheKey);
      c.get('logStep').info(`Invalidated performance cache for ${license}`);
      return c.json({ message: 'Cache invalidated successfully' });
    } catch (error) {
      c.get('logStep').warn(`Failed to invalidate cache for ${license}:`, error);
      return c.json({ message: 'Cache not available or already empty' });
    }
  },
);

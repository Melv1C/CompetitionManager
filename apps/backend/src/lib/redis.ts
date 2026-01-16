import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: times => {
        if (times > 3) {
          logger.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    redis.on('error', error => {
      logger.error('Redis error:', error);
    });

    redis.on('close', () => {
      logger.info('Redis connection closed');
    });
  }

  return redis;
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

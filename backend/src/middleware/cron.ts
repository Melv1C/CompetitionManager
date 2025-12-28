import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { Context, Next } from 'hono';

/**
 * Middleware that requires cron secret - returns 401 if secret is missing or invalid
 */
export async function requireCronSecret(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const cronSecret = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!cronSecret || cronSecret !== env.CRON_SECRET) {
    logger.warn('Access denied: Invalid or missing cron secret', {
      path: c.req.path,
      method: c.req.method,
    });
    return c.json({ error: 'Invalid cron secret' }, 401);
  }

  await next();
}

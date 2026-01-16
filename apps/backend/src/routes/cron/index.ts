import { env } from '@/lib/env';
import { Context, Hono, Next } from 'hono';
import { athleteSyncRoutes } from './athlete-sync';
import { logCleanupRoutes } from './log-cleanup';

export const cronRoutes = new Hono()
  .use(async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const cronSecret = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!cronSecret || cronSecret !== env.CRON_SECRET) {
      c.get('logStep').warn('Access denied: Invalid or missing cron secret', {
        path: c.req.path,
        method: c.req.method,
      });
      return c.json({ error: 'Invalid cron secret' }, 401);
    }

    await next();
  })
  .route('/athlete-sync', athleteSyncRoutes)
  .route('/log-cleanup', logCleanupRoutes);

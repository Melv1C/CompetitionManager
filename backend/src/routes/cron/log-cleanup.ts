import { logger } from '@/lib/logger';
import { cleanOldLogs, logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';

const logCleanupRoutes = new Hono();

const logCleanupRequestSchema = z.object({
  daysToKeep: z.coerce.number().int().nonnegative().default(30),
});

logCleanupRoutes.post('/', zValidator('json', logCleanupRequestSchema), async c => {
  try {
    const { daysToKeep } = c.req.valid('json');
    const startTime = Date.now();

    logger.info('Starting log cleanup', {
      daysToKeep,
    });

    const deletedCount = await cleanOldLogs(daysToKeep);

    const duration = Date.now() - startTime;

    logger.info('Log cleanup completed', {
      deletedCount,
      duration,
      daysToKeep,
    });

    return c.json({
      message: `Log cleanup completed deleted ${deletedCount} logs in ${duration}ms`,
      deletedCount,
      duration,
      daysToKeep,
    });
  } catch (error) {
    logError('Failed to cleanup logs', error, c);
    return c.json({ error: 'Failed to cleanup logs' }, 500);
  }
});

export { logCleanupRoutes };

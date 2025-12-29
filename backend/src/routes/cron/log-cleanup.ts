import { logger } from '@/lib/logger';
import { cleanOldLogs, logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';

const logCleanupRoutes = new Hono();

const logCleanupRequestSchema = z.object({
  daysToKeep: z.coerce.number().int().nonnegative().default(30),
  maxLogsPerCleanup: z.coerce.number().int().positive().default(1000),
});

logCleanupRoutes.post('/', zValidator('json', logCleanupRequestSchema), async c => {
  try {
    const { daysToKeep, maxLogsPerCleanup } = c.req.valid('json');
    const startTime = Date.now();

    logger.info('Starting log cleanup', {
      daysToKeep: daysToKeep,
    });

    const deletedCount = await cleanOldLogs(daysToKeep);

    const duration = Date.now() - startTime;

    logger.info('Log cleanup completed', {
      deletedCount,
      duration,
      daysToKeep: daysToKeep,
    });

    // Alert if cleanup took too long or deleted too many logs
    if (duration > 30000) {
      // 30 seconds
      logger.warn('Log cleanup took longer than expected', { duration });
    }

    if (maxLogsPerCleanup && deletedCount > maxLogsPerCleanup) {
      logger.warn('Log cleanup deleted more logs than expected', {
        deletedCount,
        maxExpected: maxLogsPerCleanup,
      });
    }

    return c.json({
      message: 'Log cleanup completed deleted ' + deletedCount + ' logs in ' + duration + 'ms',
    });
  } catch (error) {
    logError('Failed to cleanup logs', error, c);
    return c.json({ error: 'Failed to cleanup logs' }, 500);
  }
});

export { logCleanupRoutes };

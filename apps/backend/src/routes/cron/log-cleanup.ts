import { cleanOldLogs } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import z from 'zod';

const logCleanupRequestSchema = z.object({
  daysToKeep: z.coerce.number().int().nonnegative().default(30),
});

export const logCleanupRoutes = new Hono().post(
  '/',
  zValidator('json', logCleanupRequestSchema),
  async c => {
    const { daysToKeep } = c.req.valid('json');
    const startTime = Date.now();

    c.get('logStep').info('Starting log cleanup', {
      daysToKeep,
    });

    const deletedCount = await cleanOldLogs(daysToKeep);

    const duration = Date.now() - startTime;

    c.get('logStep').info('Log cleanup completed', {
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
  },
);

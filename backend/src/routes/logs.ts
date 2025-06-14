import { requirePermissions } from '@/middleware/access-control';
import { requireAuth } from '@/middleware/auth';
import { serviceManager } from '@/services';
import { logError, queryLogs } from '@/utils/log-utils';
import { LogQuery$ } from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const logsRoutes = new Hono();

// Middleware to ensure authentication for all log routes
logsRoutes.use('*', requireAuth);

// GET /logs - Query logs with filters
logsRoutes.get(
  '/',
  requirePermissions({
    logs: ['read'],
  }),
  zValidator('query', LogQuery$),
  async (c) => {
    try {
      const query = c.req.valid('query');
      const result = await queryLogs(query);
      return c.json(result);
    } catch (error) {
      logError('Failed to query logs', error, c);
      return c.json({ error: 'Failed to query logs' }, 500);
    }
  }
);

// POST /logs/cleanup - Trigger manual log cleanup
logsRoutes.post(
  '/cleanup',
  requirePermissions({
    logs: ['cleanup'],
  }),
  async (c) => {
    try {
      const logCleanupService = serviceManager.getLogCleanupService();
      const result = await logCleanupService.triggerCleanup();

      return c.json({
        message: 'Log cleanup completed',
        ...result,
      });
    } catch (error) {
      logError('Log cleanup failed', error, c);
      return c.json({ error: 'Log cleanup failed' }, 500);
    }
  }
);

export { logsRoutes };

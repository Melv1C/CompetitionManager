import { logger } from '@/lib/logger';
import { serviceManager } from '@/services';
import { queryLogs } from '@/utils/log-utils';
import { LogQuery$ } from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const logsRoutes = new Hono();

// GET /logs - Query logs with filters
logsRoutes.get('/', zValidator('query', LogQuery$), async (c) => {
  try {
    const query = c.req.valid('query');
    const result = await queryLogs(query);
    return c.json(result);
  } catch (error) {
    logger.error('Failed to query logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return c.json({ error: 'Failed to query logs' }, 500);
  }
});

// POST /logs/cleanup - Trigger manual log cleanup
logsRoutes.post('/cleanup', async (c) => {
  try {
    const logCleanupService = serviceManager.getLogCleanupService();
    const result = await logCleanupService.triggerCleanup();

    return c.json({
      message: 'Log cleanup completed',
      ...result,
    });
  } catch (error) {
    logger.error('Manual log cleanup failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return c.json({ error: 'Log cleanup failed' }, 500);
  }
});

export { logsRoutes };

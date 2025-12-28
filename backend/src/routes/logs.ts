import { requireAdmin, requireAuth } from '@/middleware/auth';
import { logError, queryLogs } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import { LogQuery$ } from '@repo/core/schemas';
import { Hono } from 'hono';

const logsRoutes = new Hono();

// Middleware to ensure authentication for all log routes
logsRoutes.use('*', requireAuth);

// GET /logs - Query logs with filters
logsRoutes.get('/', requireAdmin, zValidator('query', LogQuery$), async c => {
  try {
    const query = c.req.valid('query');
    const result = await queryLogs(query);
    return c.json(result);
  } catch (error) {
    logError('Failed to query logs', error, c);
    return c.json({ error: 'Failed to query logs' }, 500);
  }
});

export { logsRoutes };

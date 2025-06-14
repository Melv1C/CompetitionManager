import { auth } from '@/lib/auth';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { createSocketServer } from '@/lib/socket';
import { loggerMiddleware } from '@/middleware/logger';
import { serviceManager } from '@/services';
import { queryLogs } from '@/utils/log-utils';
import { LogQuery$ } from '@competition-manager/core/schemas';
import { serve } from '@hono/node-server';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '/api/*', // or replace with "*" to enable cors for all routes
  cors({
    origin: env.BETTER_AUTH_URL,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

app.use('/api/*', loggerMiddleware);

// API endpoints for logs
app.get(
  '/api/logs',
  zValidator('query', LogQuery$), // Validate query parameters
  async (c) => {
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
  }
);

// Endpoint to trigger manual log cleanup
app.post('/api/logs/cleanup', async (c) => {
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

// Health check endpoint
app.get('/api/health', (c) => {
  const healthStatus = serviceManager.getHealthStatus();
  return c.json(healthStatus);
});

const httpServer = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  async (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);

    // Initialize services after server is running
    try {
      await serviceManager.initialize();
    } catch (error) {
      logger.error('Failed to initialize services', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      process.exit(1);
    }
  }
);

// Initialize Socket.IO server
createSocketServer(httpServer);

console.log('Socket.IO server initialized');

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  try {
    await serviceManager.shutdown();
    httpServer.close(() => {
      logger.info('Server shut down successfully');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error('Error during shutdown', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

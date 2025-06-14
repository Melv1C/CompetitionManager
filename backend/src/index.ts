
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { createSocketServer } from '@/lib/socket';
import { serviceManager } from '@/services';
import { serve } from '@hono/node-server';
import { getAPI } from './api';

const app = getAPI();

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

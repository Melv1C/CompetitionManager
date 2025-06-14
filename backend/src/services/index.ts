import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { LogCleanupService } from './log-cleanup';
import { scheduler } from './scheduler';

export class ServiceManager {
  private logCleanupService: LogCleanupService;
  private isInitialized = false;

  constructor() {
    this.logCleanupService = new LogCleanupService({
      enabled: env.LOG_CLEANUP_ENABLED,
      daysToKeep: env.LOG_CLEANUP_DAYS_TO_KEEP,
      cronExpression: env.LOG_CLEANUP_SCHEDULE,
      maxLogsPerCleanup: env.LOG_CLEANUP_MAX_PER_RUN,
    });
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Services already initialized');
      return;
    }

    try {
      logger.info('Initializing services...');

      // Initialize log cleanup service
      this.logCleanupService.initialize();

      // Start the scheduler
      scheduler.start();

      this.isInitialized = true;
      logger.info('All services initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize services', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Graceful shutdown of all services
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    logger.info('Shutting down services...');

    try {
      scheduler.stop();
      this.isInitialized = false;
      logger.info('Services shut down successfully');
    } catch (error) {
      logger.error('Error during service shutdown', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get log cleanup service instance for manual operations
   */
  getLogCleanupService(): LogCleanupService {
    return this.logCleanupService;
  }

  /**
   * Health check for all services
   */
  getHealthStatus(): { healthy: boolean; services: Record<string, boolean> } {
    return {
      healthy: this.isInitialized,
      services: {
        scheduler: this.isInitialized,
        logCleanup: this.logCleanupService.getConfig().enabled,
      },
    };
  }
}

// Global service manager instance
export const serviceManager = new ServiceManager();

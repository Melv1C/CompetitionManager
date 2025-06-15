import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { cleanOldLogs } from '@/utils/log-utils';
import type { Logger } from 'winston';
import { scheduler, type ScheduledTask } from './scheduler';

export interface LogCleanupConfig {
  enabled: boolean;
  daysToKeep: number;
  cronExpression: string;
  maxLogsPerCleanup?: number;
}

export class LogCleanupService {
  private config: LogCleanupConfig;
  private prodLogger: Logger | null = null;

  constructor(config: LogCleanupConfig) {
    this.config = config;
    if (env.NODE_ENV === 'production') {
      this.prodLogger = logger;
    }
  }

  /**
   * Initialize and register the log cleanup task
   */
  initialize(): void {
    if (!this.config.enabled) {
      this.prodLogger?.info('Log cleanup service disabled');
      return;
    }

    const task: ScheduledTask = {
      name: 'log-cleanup',
      cronExpression: this.config.cronExpression,
      handler: async () => {
        try {
          const deletedCount = await this.performCleanup();
          this.prodLogger?.info('Log cleanup task completed', {
            deletedCount,
            daysToKeep: this.config.daysToKeep,
          });
        } catch (error) {
          this.prodLogger?.error('Log cleanup task failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error; // Re-throw to let scheduler handle it
        }
      },
      enabled: true,
    };

    scheduler.register(task);

    this.prodLogger?.info('Log cleanup service initialized', {
      daysToKeep: this.config.daysToKeep,
      cronExpression: this.config.cronExpression,
    });
  }

  /**
   * Perform the actual log cleanup
   */
  private async performCleanup() {
    try {
      const startTime = Date.now();

      this.prodLogger?.info('Starting log cleanup', {
        daysToKeep: this.config.daysToKeep,
      });

      const deletedCount = await cleanOldLogs(this.config.daysToKeep);

      const duration = Date.now() - startTime;

      this.prodLogger?.info('Log cleanup completed', {
        deletedCount,
        duration,
        daysToKeep: this.config.daysToKeep,
      });

      // Alert if cleanup took too long or deleted too many logs
      if (duration > 30000) {
        // 30 seconds
        logger.warn('Log cleanup took longer than expected', { duration });
      }

      if (
        this.config.maxLogsPerCleanup &&
        deletedCount > this.config.maxLogsPerCleanup
      ) {
        logger.warn('Log cleanup deleted more logs than expected', {
          deletedCount,
          maxExpected: this.config.maxLogsPerCleanup,
        });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Log cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Re-throw to let scheduler handle it
    }
  }

  /**
   * Manual cleanup trigger (useful for testing or admin endpoints)
   */
  async triggerCleanup(): Promise<{ deletedCount: number; duration: number }> {
    const startTime = Date.now();
    const deletedCount = await this.performCleanup();
    const duration = Date.now() - startTime;

    return { deletedCount, duration };
  }

  /**
   * Get cleanup statistics
   */
  getConfig(): LogCleanupConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (useful for runtime updates)
   */
  updateConfig(newConfig: Partial<LogCleanupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.prodLogger?.info('Log cleanup configuration updated', this.config);
  }
}

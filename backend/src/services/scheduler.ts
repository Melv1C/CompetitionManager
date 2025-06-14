import { logger } from '@/lib/logger';

export type ScheduledTask = {
  name: string;
  cronExpression: string;
  handler: () => Promise<void>;
  enabled: boolean;
};

export class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  /**
   * Register a scheduled task
   */
  register(task: ScheduledTask): void {
    this.tasks.set(task.name, task);
    logger.info(`Scheduled task registered: ${task.name}`, {
      cronExpression: task.cronExpression,
      enabled: task.enabled,
    });
  }

  /**
   * Start all registered tasks
   */
  start(): void {
    if (this.isRunning) {
      logger.warn('Task scheduler is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting task scheduler');

    for (const [name, task] of this.tasks) {
      if (task.enabled) {
        this.scheduleTask(name, task);
      }
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    if (!this.isRunning) return;

    logger.info('Stopping task scheduler');

    for (const [name, timer] of this.timers) {
      clearTimeout(timer);
      logger.debug(`Stopped scheduled task: ${name}`);
    }

    this.timers.clear();
    this.isRunning = false;
  }

  /**
   * Get next execution time based on cron-like expression
   * Simplified implementation for common patterns
   */
  private getNextExecutionTime(cronExpression: string): number {
    const patterns = {
      '@daily': 24 * 60 * 60 * 1000, // 24 hours
      '@hourly': 60 * 60 * 1000, // 1 hour
      '@weekly': 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    if (patterns[cronExpression as keyof typeof patterns]) {
      return patterns[cronExpression as keyof typeof patterns];
    }

    // Default to daily if pattern not recognized
    logger.warn(`Unknown cron pattern: ${cronExpression}, defaulting to daily`);
    return patterns['@daily'];
  }

  /**
   * Schedule a single task
   */
  private scheduleTask(name: string, task: ScheduledTask): void {
    const delay = this.getNextExecutionTime(task.cronExpression);

    const timer = setTimeout(async () => {
      try {
        logger.info(`Executing scheduled task: ${name}`);
        const startTime = Date.now();

        await task.handler();

        const duration = Date.now() - startTime;
        logger.info(`Scheduled task completed: ${name}`, { duration });

        // Reschedule the task
        if (this.isRunning) {
          this.scheduleTask(name, task);
        }
      } catch (error) {
        logger.error(`Scheduled task failed: ${name}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        // Reschedule even after failure
        if (this.isRunning) {
          this.scheduleTask(name, task);
        }
      }
    }, delay);

    this.timers.set(name, timer);

    const nextExecution = new Date(Date.now() + delay);
    logger.debug(
      `Scheduled task: ${name} will run at ${nextExecution.toISOString()}`
    );
  }
}

// Global scheduler instance
export const scheduler = new TaskScheduler();

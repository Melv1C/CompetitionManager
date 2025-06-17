import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { Logger } from 'winston';
import { AthleteSyncService } from './athlete-sync';
import { LogCleanupService } from './log-cleanup';
import { scheduler } from './scheduler';
import { SeedService } from './seed';

export class ServiceManager {
  private logCleanupService: LogCleanupService;
  private seedService: SeedService;
  private athleteSyncService: AthleteSyncService;
  private isInitialized = false;
  private prodLogger: Logger | null = null;

  constructor() {
    this.logCleanupService = new LogCleanupService({
      enabled: env.LOG_CLEANUP_ENABLED,
      daysToKeep: env.LOG_CLEANUP_DAYS_TO_KEEP,
      cronExpression: env.LOG_CLEANUP_SCHEDULE,
      maxLogsPerCleanup: env.LOG_CLEANUP_MAX_PER_RUN,
    });

    this.seedService = new SeedService({
      enabled: env.DB_SEED_ENABLED,
      forceReseed: env.DB_SEED_FORCE_RESEED,
    });

    this.athleteSyncService = new AthleteSyncService({
      enabled: env.ATHLETE_SYNC_ENABLED,
      cronExpression: env.ATHLETE_SYNC_SCHEDULE,
      lbfaUrl: env.LBFA_URL,
      lbfaUsername: env.LBFA_USERNAME,
      lbfaPassword: env.LBFA_PASSWORD,
      useMock: env.ATHLETE_SYNC_USE_MOCK,
    });

    if (env.NODE_ENV === 'production') {
      this.prodLogger = logger;
    }
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.prodLogger?.warn('Services already initialized');
      return;
    }
    try {
      this.prodLogger?.info('Initializing services...');

      // Initialize log cleanup service
      this.logCleanupService.initialize(); // Initialize database seeding
      await this.seedService.initialize();

      // Initialize athlete sync service
      await this.athleteSyncService.initialize();

      // Start the scheduler
      scheduler.start();

      this.isInitialized = true;
      this.prodLogger?.info('All services initialized successfully');
    } catch (error) {
      this.prodLogger?.error('Failed to initialize services', {
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

    this.prodLogger?.info('Shutting down services...');

    try {
      scheduler.stop();
      this.isInitialized = false;
      this.prodLogger?.info('Services shut down successfully');
    } catch (error) {
      this.prodLogger?.error('Error during service shutdown', {
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
   * Get seed service instance for manual operations
   */
  getSeedService(): SeedService {
    return this.seedService;
  }
  /**
   * Get athlete sync service instance for manual operations
   */
  getAthleteSyncService(): AthleteSyncService {
    return this.athleteSyncService;
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
        seeding: this.seedService.getConfig().enabled,
        athleteSync: this.athleteSyncService.getConfig().enabled,
      },
    };
  }
}

// Global service manager instance
export const serviceManager = new ServiceManager();

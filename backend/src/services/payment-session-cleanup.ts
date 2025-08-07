import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { Logger } from 'winston';
import { expireOldPaymentSessions } from '@/utils/payment-session-utils';
import { scheduler } from './scheduler';

export interface PaymentSessionCleanupConfig {
  enabled: boolean;
  cronExpression: string;
}

export class PaymentSessionCleanupService {
  private config: PaymentSessionCleanupConfig;
  private prodLogger: Logger | null = null;

  constructor(config: PaymentSessionCleanupConfig) {
    this.config = config;

    if (env.NODE_ENV === 'production') {
      this.prodLogger = logger;
    }
  }

  /**
   * Initialize the payment session cleanup service
   */
  initialize(): void {
    this.prodLogger?.info('Initializing payment session cleanup service', {
      config: this.config,
    });

    if (this.config.enabled) {
      scheduler.register({
        name: 'payment-session-cleanup',
        cronExpression: this.config.cronExpression,
        handler: this.cleanup.bind(this),
        enabled: true,
      });

      this.prodLogger?.info('Payment session cleanup service scheduled');
    } else {
      this.prodLogger?.info('Payment session cleanup service disabled');
    }
  }

  /**
   * Perform payment session cleanup
   */
  async cleanup(): Promise<void> {
    try {
      this.prodLogger?.info('Starting payment session cleanup');

      const expiredSessions = await expireOldPaymentSessions();

      this.prodLogger?.info('Payment session cleanup completed', {
        expiredSessions: expiredSessions.length,
        sessionIds: expiredSessions.map((s) => s.eid),
      });

      if (expiredSessions.length > 0) {
        logger.info(`Expired ${expiredSessions.length} payment sessions`);
      }
    } catch (error) {
      this.prodLogger?.error('Payment session cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Manual cleanup trigger
   */
  async manualCleanup(): Promise<number> {
    this.prodLogger?.info('Manual payment session cleanup triggered');
    await this.cleanup();

    const expiredSessions = await expireOldPaymentSessions();
    return expiredSessions.length;
  }

  /**
   * Get current configuration
   */
  getConfig(): PaymentSessionCleanupConfig {
    return { ...this.config };
  }
}

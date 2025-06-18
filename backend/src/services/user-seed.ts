import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserRole$ } from '@competition-manager/core/schemas';
import type { Logger } from 'winston';

export interface UserSeedConfig {
  enabled: boolean;
}

export class UserSeedService {
  private config: UserSeedConfig;
  private prodLogger: Logger | null = null;

  constructor(config: UserSeedConfig) {
    this.config = config;
    if (env.NODE_ENV === 'production') {
      this.prodLogger = logger;
    }
  }

  async initialize(): Promise<{ created: number; skipped: number } | null> {
    if (!this.config.enabled) {
      this.prodLogger?.info('User seeding disabled');
      return null;
    }
    this.prodLogger?.info('Starting user seeding...');
    const result = await this.seedUsers();
    this.prodLogger?.info('User seeding completed', result);
    return result;
  }

  private async seedUsers(): Promise<{ created: number; skipped: number }> {
    const seeds = [
      {
        email: env.DB_SEED_ADMIN_EMAIL,
        password: env.DB_SEED_ADMIN_PASSWORD,
        name: env.DB_SEED_ADMIN_NAME || 'Admin',
        role: UserRole$.enum.admin,
      },
      {
        email: env.DB_SEED_USER_EMAIL,
        password: env.DB_SEED_USER_PASSWORD,
        name: env.DB_SEED_USER_NAME || 'User',
        role: UserRole$.enum.user,
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const seed of seeds) {
      if (!seed.email || !seed.password) {
        logger.warn('Missing credentials for seed user', { email: seed.email });
        skipped++;
        continue;
      }

      const existing = await prisma.user.findUnique({
        where: { email: seed.email },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await auth.api.admin.createUser({
        body: {
          email: seed.email,
          password: seed.password,
          name: seed.name,
          role: seed.role,
        },
        use: [],
      });

      created++;
    }

    return { created, skipped };
  }

  getConfig(): UserSeedConfig {
    return { ...this.config };
  }
}

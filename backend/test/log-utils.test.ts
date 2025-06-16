import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: 'http://localhost',
    BETTER_AUTH_SECRET: 'secret',
    BETTER_AUTH_URL: 'http://auth',
    LOG_CLEANUP_ENABLED: true,
    LOG_CLEANUP_DAYS_TO_KEEP: 30,
    LOG_CLEANUP_SCHEDULE: '@daily',
    DB_SEED_ENABLED: false,
    DB_SEED_FORCE_RESEED: false,
    ATHLETE_SYNC_ENABLED: false,
    ATHLETE_SYNC_SCHEDULE: '@daily',
    LBFA_URL: 'http://lbfa',
    LBFA_USERNAME: 'user',
    LBFA_PASSWORD: 'pass'
  }
}));

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      log: {
        deleteMany: vi.fn().mockResolvedValue({ count: 5 })
      }
    }
  };
});

vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }));

const { prisma } = await import('@/lib/prisma');
const { cleanOldLogs } = await import('@/utils/log-utils');

describe('cleanOldLogs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-31T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('deletes logs older than specified days', async () => {
    const deleted = await cleanOldLogs(5);
    expect(prisma.log.deleteMany).toHaveBeenCalledWith({
      where: {
        timestamp: {
          lt: new Date('2024-01-26T00:00:00Z')
        }
      }
    });
    expect(deleted).toBe(5);
  });
});

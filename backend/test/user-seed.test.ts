import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserSeedService } from '@/services/user-seed';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      admin: {
        createUser: vi.fn().mockResolvedValue({}),
      },
    },
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/env', () => ({
  env: {
    DB_SEED_ADMIN_EMAIL: 'admin@example.com',
    DB_SEED_ADMIN_PASSWORD: 'pass',
    DB_SEED_ADMIN_NAME: 'Admin',
    DB_SEED_USER_EMAIL: 'user@example.com',
    DB_SEED_USER_PASSWORD: 'pass',
    DB_SEED_USER_NAME: 'User',
    NODE_ENV: 'development',
  },
}));

describe('UserSeedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates users when they do not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const service = new UserSeedService({ enabled: true });
    const result = await service.initialize();
    expect(result).toEqual({ created: 2, skipped: 0 });
    expect(auth.api.admin.createUser).toHaveBeenCalledTimes(2);
  });

  it('skips existing users', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1' } as any);
    const service = new UserSeedService({ enabled: true });
    const result = await service.initialize();
    expect(result).toEqual({ created: 0, skipped: 2 });
  });
});

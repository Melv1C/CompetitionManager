import { PrismaClient } from '@generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // log: ['query', 'info', 'warn', 'error'], // Uncomment for debugging
  });

if (env.NODE_ENV !== 'development') globalForPrisma.prisma = prisma;

export type { Prisma } from '@generated/prisma/client';

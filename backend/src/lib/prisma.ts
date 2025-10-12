import { PrismaClient } from '@generated/prisma';
import { env } from './env';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'], // Uncomment for debugging
  });

if (env.NODE_ENV !== 'development') globalForPrisma.prisma = prisma;

export type { Prisma } from '@generated/prisma';

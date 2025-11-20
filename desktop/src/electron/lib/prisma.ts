import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaPg({
  connectionString: process.env.DB_LOCAL_URL,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // log: ['query', 'info', 'warn', 'error'], // Uncomment for debugging
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export type { Prisma } from '../generated/prisma/client';

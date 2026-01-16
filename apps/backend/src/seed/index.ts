import { env } from '@/lib/env';
import { prisma } from '@repo/database';
import { seedUsers } from './seeders/users';
import type { SeedContext } from './types';

function createContext(): SeedContext {
  return {
    env: env.NODE_ENV,
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
    log: (message: string) => console.log(message),
  };
}

export async function seed() {
  const ctx = createContext();

  console.log('🌱 Starting database seed...');
  console.log(`   Environment: ${ctx.env}`);
  console.log('');

  try {
    // 1. Sync JSON data (runs in all environments)
    // This ensures reference data stays in sync with version-controlled JSON files
    // await syncJsonData(ctx);
    console.log('');

    // 2. Seed development-only data
    // This creates test users only in development
    await seedUsers(ctx);
    console.log('');

    console.log('✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run directly if called as a script
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

import { prisma } from '@repo/database';
import { UserRole$ } from '@repo/utils';
import { auth } from '../../lib/auth';
import type { SeedContext } from '../types';

const DEV_USERS = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123!',
    role: 'admin',
  },
  {
    name: 'Basic User',
    email: 'user@example.com',
    password: 'user1234!',
    role: 'user',
  },
] as const;

export async function seedUsers(ctx: SeedContext): Promise<void> {
  if (ctx.env !== 'development') {
    ctx.log('Skipping user seeding in non-dev environment');
    return;
  }

  ctx.log('Seeding development users...');

  let created = 0;
  let skipped = 0;

  for (const userData of DEV_USERS) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      ctx.log(`  → User already exists: ${userData.email}`);
      skipped++;
      continue;
    }

    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      });

      if (result.user) {
        await prisma.user.update({
          where: { id: result.user.id },
          data: {
            role: UserRole$.enum[userData.role],
            emailVerified: true,
          },
        });
        ctx.log(`  ✓ Created user: ${userData.email} (${userData.role})`);
        created++;
      }
    } catch (error) {
      ctx.log(
        `  ✗ Failed to create user ${userData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  ctx.log(`Seeded users: ${created} created, ${skipped} skipped`);
}

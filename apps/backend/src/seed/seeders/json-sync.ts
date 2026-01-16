import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SeedContext } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface Category {
  slug: string;
  name: string;
  description: string;
}

/**
 * Example of syncing data from a JSON file to the database.
 * This pattern ensures the database stays in sync with your JSON source of truth.
 *
 * Use cases:
 * - Static reference data (categories, tags, permissions, etc.)
 * - Configuration that needs to be version-controlled
 * - Data that should be identical across all environments
 */
export async function syncJsonData(ctx: SeedContext): Promise<void> {
  ctx.log('Syncing JSON data...');

  await syncCategories(ctx);
  // Add more sync functions here as needed
  // await syncPermissions(ctx);
  // await syncTags(ctx);
}

async function syncCategories(ctx: SeedContext): Promise<void> {
  const dataPath = join(__dirname, '../data/categories.json');
  const categories: Category[] = JSON.parse(readFileSync(dataPath, 'utf-8'));

  ctx.log(`  Syncing ${categories.length} categories...`);

  /**
   * NOTE: This is an example. You need to create a Category model in your schema first.
   *
   * Example schema addition in packages/database/prisma/schema.prisma:
   *
   * model Category {
   *   id          String   @id @default(cuid())
   *   slug        String   @unique
   *   name        String
   *   description String?
   *   createdAt   DateTime @default(now())
   *   updatedAt   DateTime @updatedAt
   * }
   *
   * Uncomment the code below after adding the model:
   */

  // import { prisma } from '@repo/database';
  // for (const category of categories) {
  //   await prisma.category.upsert({
  //     where: { slug: category.slug },
  //     update: {
  //       name: category.name,
  //       description: category.description,
  //     },
  //     create: {
  //       slug: category.slug,
  //       name: category.name,
  //       description: category.description,
  //     },
  //   });
  //   ctx.log(`    ✓ Synced category: ${category.name}`);
  // }

  // For now, just log what would be synced
  for (const category of categories) {
    ctx.log(`    → Would sync category: ${category.name} (${category.slug})`);
  }

  ctx.log(`  ✓ Categories sync complete`);
}

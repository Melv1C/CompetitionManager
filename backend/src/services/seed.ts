import categoriesData from '@/data/categories.json';
import clubsData from '@/data/clubs.json';
import eventsData from '@/data/events.json';
import { auth } from '@/lib/auth';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { UserRole$ } from '@repo/core/schemas';
import type { Logger } from 'winston';

export interface SeedConfig {
  enabled: boolean;
  forceReseed?: boolean;
  usersEnabled?: boolean;
}

export interface SeedResult {
  events: {
    created: number;
    skipped: number;
  };
  categories: {
    created: number;
    skipped: number;
  };
  clubs: {
    created: number;
    skipped: number;
  };
  users: {
    created: number;
    skipped: number;
  };
}

export class SeedService {
  private config: SeedConfig;
  private prodLogger: Logger | null = null;

  constructor(config: SeedConfig) {
    this.config = config;
    if (process.env.NODE_ENV === 'production') {
      this.prodLogger = logger;
    }
  }

  /**
   * Initialize and run seeding if enabled
   */
  async initialize(): Promise<SeedResult | null> {
    if (!this.config.enabled) {
      this.prodLogger?.info('Database seeding disabled');
      return null;
    }

    this.prodLogger?.info('Starting database seeding...');
    const result = await this.seedDatabase();
    this.prodLogger?.info('Database seeding completed', result);

    return result;
  }
  /**
   * Main seeding function
   */
  async seedDatabase(): Promise<SeedResult> {
    const result: SeedResult = {
      events: { created: 0, skipped: 0 },
      categories: { created: 0, skipped: 0 },
      clubs: { created: 0, skipped: 0 },
      users: { created: 0, skipped: 0 },
    };

    try {
      // Seed users first (if enabled)
      if (this.config.usersEnabled && env.DB_SEED_USERS_ENABLED) {
        result.users = await this.seedUsers();
      }

      // Seed clubs
      result.clubs = await this.seedClubs();

      // Seed events
      result.events = await this.seedEvents();

      // Then seed categories
      result.categories = await this.seedCategories();

      return result;
    } catch (error) {
      this.prodLogger?.error('Error during database seeding', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  /**
   * Seed events from events.json
   */
  private async seedEvents(): Promise<{ created: number; skipped: number }> {
    try {
      let created = 0;
      let skipped = 0;

      for (const eventData of eventsData) {
        // Skip incomplete entries
        if (
          !eventData.name ||
          !eventData.abbr ||
          !eventData.type ||
          !eventData.group
        ) {
          logger.warn('Skipping incomplete event entry', eventData);
          skipped++;
          continue;
        }

        // Check if event already exists
        const existingEvent = await prisma.event.findUnique({
          where: { name: eventData.name },
        });

        if (existingEvent && !this.config.forceReseed) {
          skipped++;
          continue;
        }

        if (existingEvent && this.config.forceReseed) {
          // Update existing event
          await prisma.event.update({
            where: { id: existingEvent.id },
            data: {
              name: eventData.name,
              abbr: eventData.abbr,
              type: eventData.type,
              group: eventData.group,
            },
          });
          logger.info('Updated event', { ...eventData, id: existingEvent.id });
        } else {
          // Create new event
          await prisma.event.create({
            data: {
              name: eventData.name,
              abbr: eventData.abbr,
              type: eventData.type,
              group: eventData.group,
            },
          });
          logger.info('Created event', { ...eventData });
        }

        created++;
      }

      this.prodLogger?.info('Events seeding completed', { created, skipped });
      return { created, skipped };
    } catch (error) {
      logger.error('Error seeding events', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  /**
   * Seed categories from categories.json
   */
  private async seedCategories(): Promise<{
    created: number;
    skipped: number;
  }> {
    try {
      let created = 0;
      let skipped = 0;

      for (const categoryData of categoriesData) {
        // Skip incomplete entries
        if (!categoryData.name || !categoryData.abbr) {
          logger.warn('Skipping incomplete category entry', categoryData);
          skipped++;
          continue;
        }

        // Check if category already exists
        const existingCategory = await prisma.category.findUnique({
          where: { name: categoryData.name },
        });

        if (existingCategory && !this.config.forceReseed) {
          skipped++;
          continue;
        }

        const categoryPayload = {
          name: categoryData.name,
          abbr: categoryData.abbr,
          baseCategory: categoryData.baseCategory,
          abbrBaseCategory: categoryData.abbrBaseCategory,
          gender: categoryData.gender,
          masterAgeGroup: categoryData.masterAgeGroup || null,
          order: categoryData.order,
        };

        if (existingCategory && this.config.forceReseed) {
          // Update existing category
          await prisma.category.update({
            where: { id: existingCategory.id },
            data: categoryPayload,
          });
          logger.info('Updated category', {
            ...categoryData,
            id: existingCategory.id,
          });
        } else {
          // Create new category
          await prisma.category.create({
            data: categoryPayload,
          });
          logger.info('Created category', { ...categoryData });
        }

        created++;
      }

      this.prodLogger?.info('Categories seeding completed', {
        created,
        skipped,
      });
      return { created, skipped };
    } catch (error) {
      logger.error('Error seeding categories', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Seed clubs from clubs.json
   */
  private async seedClubs(): Promise<{ created: number; skipped: number }> {
    try {
      let created = 0;
      let skipped = 0;

      for (const clubData of clubsData) {
        // Skip incomplete entries
        if (!clubData.name || !clubData.abbr) {
          logger.warn('Skipping incomplete club entry', clubData);
          skipped++;
          continue;
        }

        // Check if club already exists
        const existingClub = await prisma.club.findUnique({
          where: { abbr: clubData.abbr },
        });

        if (existingClub && !this.config.forceReseed) {
          skipped++;
          continue;
        }

        const clubPayload = {
          name: clubData.name,
          abbr: clubData.abbr,
          country: clubData.country || null,
        };

        if (existingClub && this.config.forceReseed) {
          // Update existing club
          await prisma.club.update({
            where: { id: existingClub.id },
            data: clubPayload,
          });
          logger.info('Updated club', { ...clubPayload, id: existingClub.id });
        } else {
          // Create new club
          const newClub = await prisma.club.create({
            data: clubPayload,
          });
          logger.info('Created club', { ...clubPayload, id: newClub.id });
        }

        created++;
      }

      this.prodLogger?.info('Clubs seeding completed', { created, skipped });
      return { created, skipped };
    } catch (error) {
      logger.error('Error seeding clubs', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
  /**
   * Seed users (admin and regular user) from environment variables
   */
  private async seedUsers(): Promise<{ created: number; skipped: number }> {
    try {
      let created = 0;
      let skipped = 0;

      // Seed admin user
      if (
        env.DB_SEED_ADMIN_EMAIL &&
        env.DB_SEED_ADMIN_PASSWORD &&
        env.DB_SEED_ADMIN_NAME
      ) {
        // Check if admin user already exists
        const existingAdmin = await prisma.user.findUnique({
          where: { email: env.DB_SEED_ADMIN_EMAIL },
        });

        if (existingAdmin) {
          logger.info('Admin user already exists, skipping', {
            email: env.DB_SEED_ADMIN_EMAIL,
          });
          skipped++;
        } else {
          try {
            // Create new admin user using Better Auth
            const result = await auth.api.signUpEmail({
              body: {
                name: env.DB_SEED_ADMIN_NAME,
                email: env.DB_SEED_ADMIN_EMAIL,
                password: env.DB_SEED_ADMIN_PASSWORD,
              },
            });

            if (result.user) {
              // Update role to admin
              await prisma.user.update({
                where: { id: result.user.id },
                data: {
                  role: UserRole$.enum.admin,
                  emailVerified: true,
                },
              });

              logger.info('Created admin user', {
                email: env.DB_SEED_ADMIN_EMAIL,
                name: env.DB_SEED_ADMIN_NAME,
                id: result.user.id,
              });
              created++;
            }
          } catch (error) {
            logger.error('Error creating admin user', {
              email: env.DB_SEED_ADMIN_EMAIL,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      // Seed regular user
      if (
        env.DB_SEED_USER_EMAIL &&
        env.DB_SEED_USER_PASSWORD &&
        env.DB_SEED_USER_NAME
      ) {
        // Check if regular user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: env.DB_SEED_USER_EMAIL },
        });

        if (existingUser) {
          logger.info('Regular user already exists, skipping', {
            email: env.DB_SEED_USER_EMAIL,
          });
          skipped++;
        } else {
          try {
            // Create new regular user using Better Auth
            const result = await auth.api.signUpEmail({
              body: {
                name: env.DB_SEED_USER_NAME,
                email: env.DB_SEED_USER_EMAIL,
                password: env.DB_SEED_USER_PASSWORD,
              },
            });

            if (result.user) {
              // Ensure user role and verified email
              await prisma.user.update({
                where: { id: result.user.id },
                data: {
                  role: UserRole$.enum.user,
                  emailVerified: true,
                },
              });

              logger.info('Created regular user', {
                email: env.DB_SEED_USER_EMAIL,
                name: env.DB_SEED_USER_NAME,
                id: result.user.id,
              });
              created++;
            }
          } catch (error) {
            logger.error('Error creating regular user', {
              email: env.DB_SEED_USER_EMAIL,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      this.prodLogger?.info('Users seeding completed', { created, skipped });
      return { created, skipped };
    } catch (error) {
      logger.error('Error seeding users', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get seeding configuration
   */
  getConfig(): SeedConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SeedConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.prodLogger?.info('Seed service configuration updated', this.config);
  }

  /**
   * Manual trigger for seeding (useful for admin endpoints)
   */
  async triggerSeed(forceReseed = false): Promise<SeedResult> {
    const originalForceReseed = this.config.forceReseed;
    this.config.forceReseed = forceReseed;

    try {
      return await this.seedDatabase();
    } finally {
      this.config.forceReseed = originalForceReseed;
    }
  }
}

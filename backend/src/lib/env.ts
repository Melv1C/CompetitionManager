import { Password$, User$ } from '@repo/core/schemas';
import 'dotenv/config';
import { z } from 'zod/v4';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  // Log cleanup configuration
  LOG_CLEANUP_ENABLED: z.stringbool().default(true),
  LOG_CLEANUP_DAYS_TO_KEEP: z.coerce.number().default(30),
  LOG_CLEANUP_SCHEDULE: z
    .enum(['@daily', '@hourly', '@weekly'])
    .default('@daily'),
  LOG_CLEANUP_MAX_PER_RUN: z.coerce.number().optional(),

  // Database seeding configuration
  DB_SEED_ENABLED: z.stringbool().default(true),
  DB_SEED_FORCE_RESEED: z.stringbool().default(false),

  // User seeding configuration
  DB_SEED_USERS_ENABLED: z.stringbool().default(false),
  DB_SEED_ADMIN_EMAIL: User$.shape.email.default('admin@example.com'),
  DB_SEED_ADMIN_PASSWORD: Password$.default('admin123'),
  DB_SEED_ADMIN_NAME: User$.shape.name.default('Admin'),
  DB_SEED_USER_EMAIL: User$.shape.email.default('user@example.com'),
  DB_SEED_USER_PASSWORD: Password$.default('user1234'),
  DB_SEED_USER_NAME: User$.shape.name.default('User'),

  // Athlete sync configuration
  ATHLETE_SYNC_ENABLED: z.stringbool().default(true),
  ATHLETE_SYNC_SCHEDULE: z
    .enum(['@daily', '@hourly', '@weekly'])
    .default('@daily'),
  ATHLETE_SYNC_USE_MOCK: z.stringbool().default(false),

  LBFA_URL: z.url().optional(),
  LBFA_USERNAME: z.string().optional(),
  LBFA_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);

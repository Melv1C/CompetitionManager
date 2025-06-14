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
  LOG_CLEANUP_SCHEDULE: z.enum(['@daily', '@hourly', '@weekly']).default('@daily'),
  LOG_CLEANUP_MAX_PER_RUN: z.coerce.number().optional(),
});

export const env = envSchema.parse(process.env);

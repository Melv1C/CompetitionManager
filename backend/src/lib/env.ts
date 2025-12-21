import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'staging']),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.url(),
  BACKEND_URL: z.url().default('http://localhost:3000'),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
  DESKTOP_URL: z.url().default('http://localhost:5000'),

  BETTER_AUTH_SECRET: z.string().min(32),

  // Log cleanup configuration
  LOG_CLEANUP_ENABLED: z.stringbool().default(true),
  LOG_CLEANUP_DAYS_TO_KEEP: z.coerce.number().default(30),
  LOG_CLEANUP_SCHEDULE: z.enum(['@daily', '@hourly', '@weekly']).default('@daily'),
  LOG_CLEANUP_MAX_PER_RUN: z.coerce.number().optional(),

  // Athlete sync configuration
  ATHLETE_SYNC_ENABLED: z.stringbool().default(true),
  ATHLETE_SYNC_SCHEDULE: z.enum(['@daily', '@hourly', '@weekly']).default('@daily'),

  LBFA_URL: z.url().optional(),
  LBFA_USERNAME: z.string().optional(),
  LBFA_PASSWORD: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  EMAIL_USER: z.email(),
  EMAIL_PASS: z.string().min(1),
});

export const env = envSchema.parse(process.env);

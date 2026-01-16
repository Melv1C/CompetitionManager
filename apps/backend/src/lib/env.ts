import { NodeEnv$ } from '@repo/utils';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: ['../../packages/database/.env', '.env'] });

const envSchema = z.object({
  NODE_ENV: NodeEnv$,
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  BACKEND_URL: z.url().default('http://localhost:3000'),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
  ADMIN_URL: z.url().default('http://localhost:5174'),

  BETTER_AUTH_SECRET: z.string().min(32),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  EMAIL_USER: z.email(),
  EMAIL_PASS: z.string().min(1),

  LBFA_URL: z.url().optional(),
  LBFA_USERNAME: z.string().optional(),
  LBFA_PASSWORD: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  BEATHLETICS_URL: z.url().default('https://www.beathletics.be/api/athlete/new'),
  PERFORMANCE_SERVICE_TIMEOUT: z.coerce.number().default(5000),
  PERFORMANCE_CACHE_TTL: z.coerce.number().default(86400),

  CRON_SECRET: z.string().min(20),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;

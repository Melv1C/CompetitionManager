import { z } from 'zod';

/**
 * Environment variables schema for the frontend (Vite)
 *
 * Note: In Vite, only variables prefixed with VITE_ are exposed to the client.
 * These should be defined in .env files or passed during build.
 *
 * Example .env file:
 * VITE_API_URL=http://localhost:3000
 */
const envSchema = z.object({
  // Mode is provided by Vite automatically
  MODE: z.enum(['development', 'production', 'test']).default('development'),

  // Base URL for the application (usually set by Vite)
  BASE_URL: z.string().default('/'),

  // API Configuration
  VITE_API_URL: z.string().url().default('http://localhost:3000'),

  // Socket.IO Configuration
  VITE_SOCKET_URL: z.string().url().default('http://localhost:3000'),
});


console.log('Environment variables:', import.meta.env);

/**
 * Parsed and validated environment variables
 *
 * In Vite, import.meta.env contains the environment variables.
 * We merge it with some Vite-specific defaults.
 */
export const env = envSchema.parse({
  ...import.meta.env,
});

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;
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
  VITE_NODE_ENV: z.enum(['development', 'production', 'staging']).default('development'),
  VITE_PORT: z.coerce.number().min(1).default(5173),

  // API Configuration
  VITE_API_URL: z.url().default('http://localhost:3000'),
  VITE_USE_BEARER: z.stringbool().default(false),

  VITE_SHOW_SOCKET_STATUS: z.stringbool().default(false),

  // Google OAuth Configuration
  VITE_HAS_GOOGLE_AUTH: z.stringbool().default(false),
});

/**
 * Parsed and validated environment variables
 *
 * In Vite, import.meta.env contains the environment variables.
 * We merge it with some Vite-specific defaults.
 */
export const env = envSchema.parse(import.meta.env);

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

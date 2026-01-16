import { NodeEnv$ } from '@repo/utils';
import { z } from 'zod';

const envSchema = z.object({
  VITE_NODE_ENV: NodeEnv$,
  VITE_PORT: z.coerce.number().default(5173),

  // API Configuration
  VITE_API_URL: z.url().default('http://localhost:3000'),
  VITE_USE_BEARER: z.stringbool().default(false),

  VITE_SHOW_SOCKET_STATUS: z.stringbool().default(false),

  // Google OAuth Configuration
  VITE_HAS_GOOGLE_AUTH: z.stringbool().default(false),
});

export const env = envSchema.parse(import.meta.env);

export type Env = z.infer<typeof envSchema>;

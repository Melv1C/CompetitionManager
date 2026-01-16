import { z } from 'zod';

export const NodeEnv$ = z
  .enum(['development', 'production', 'staging', 'test'])
  .default('development');

export type NodeEnv = z.infer<typeof NodeEnv$>;

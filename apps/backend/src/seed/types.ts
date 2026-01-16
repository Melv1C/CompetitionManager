import { NodeEnv } from '@repo/utils';

export interface SeedContext {
  env: NodeEnv;
  log: (message: string) => void;
  verbose: boolean;
}

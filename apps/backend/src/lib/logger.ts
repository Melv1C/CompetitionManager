import { createLogger } from '@repo/logger';
import { env } from './env';

export const logger = createLogger(env.NODE_ENV);

import { NodeEnv } from '@repo/utils';
import winston from 'winston';
import { PostgresTransport } from './postgres-transport';

export function createLogger(env: NodeEnv) {
  const isDev = env === 'development';

  return winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({
        level: isDev ? 'debug' : 'warn',
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
      }),
      new PostgresTransport({
        level: 'info',
      }),
    ],
  });
}

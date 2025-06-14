import winston from 'winston';
import Transport from 'winston-transport';
import { env } from './env';
import { prisma } from './prisma';

/**
 * Custom Prisma transport for Winston - stores logs in PostgreSQL
 */
class PrismaTransport extends Transport {
  constructor(opts: any = {}) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

  const { level, message, timestamp, ...meta } = info;

    prisma.log
      .create({
        data: {
          level: level,
          message: message,
          meta: meta ? JSON.stringify(meta) : null,
          timestamp: timestamp
        },
      })
      .catch((error) => {
        // Emit error but don't block logging
        this.emit('error', error);
      });

    callback();
  }
}

// Create logger instance
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Database transport for all logs
    new PrismaTransport(),
    // Console transport for development
    ...(env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ]
      : [
          // File transport for error logs
          new winston.transports.File({
            filename: 'error.log',
            level: 'error',
          }),
        ]),
  ],
});

// Handle uncaught exceptions and rejections
logger.exceptions.handle(
  new winston.transports.File({ filename: 'exceptions.log' })
);

process.on('unhandledRejection', (ex) => {
  throw ex;
});

import { prisma } from '@repo/database';
import { LogCreate, LogCreate$ } from '@repo/utils';
import Transport from 'winston-transport';

export class PostgresTransport extends Transport {
  async log(info: LogCreate, callback: () => void) {
    setImmediate(callback);

    const { level, message, type, userId, metadata, method, path, statusCode, durationMs, steps } =
      LogCreate$.parse(info);

    try {
      await prisma.log.create({
        data: {
          type,
          level,
          message,
          userId,
          metadata: metadata ?? undefined,
          method,
          path,
          statusCode,
          durationMs,
          steps: steps ?? undefined,
        },
      });
    } catch (err) {
      // NEVER throw from logger - errors degrade gracefully
      console.error('Failed to persist log', err);
    }
  }
}

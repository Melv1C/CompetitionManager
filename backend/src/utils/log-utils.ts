import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { Log$, type LogQuery } from '@repo/core/schemas';
import type { Context } from 'hono';
import { getUser } from './auth-utils';

/**
 * Query logs from database with filtering and validation
 */
export async function queryLogs(rawQuery: LogQuery) {
  const where: any = {};

  if (rawQuery.levels) {
    where.level = {
      in: rawQuery.levels,
    };
  }
  if (rawQuery.startDate || rawQuery.endDate) {
    where.timestamp = {};
    if (rawQuery.startDate) where.timestamp.gte = rawQuery.startDate;
    if (rawQuery.endDate) where.timestamp.lte = rawQuery.endDate;
  }
  if (rawQuery.search) {
    where.message = {
      contains: rawQuery.search,
      mode: 'insensitive',
    };
  }

  // Get total count and logs in parallel
  const [totalCount, logs] = await Promise.all([
    prisma.log.count({ where }),
    prisma.log.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: rawQuery.limit,
      skip: rawQuery.offset,
    }),
  ]);

  return {
    logs: Log$.array().parse(logs),
    totalCount,
    hasMore: rawQuery.offset + rawQuery.limit < totalCount,
    page: Math.floor(rawQuery.offset / rawQuery.limit) + 1,
    totalPages: Math.ceil(totalCount / rawQuery.limit),
    pageSize: rawQuery.limit,
  };
}

/**
 * Clean old logs (older than specified days)
 */
export async function cleanOldLogs(daysToKeep: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.log.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

/**
 * Utility function for consistent error logging in try-catch blocks
 * Logs the error message, stack trace, request context, and any additional info
 * @param message - Custom message for the log
 * @param error - The error object or message to log
 * @param context - Hono context to access request info
 * @param additionalInfo - Optional additional metadata to include in the log
 */
export async function logError(
  message: string,
  error: unknown,
  context: Context,
  additionalInfo?: Record<string, any>
) {
  const user = await getUser(context);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const stackTrace = error instanceof Error ? error.stack : undefined;

  const logData = {
    method: context.req.method,
    path: context.req.path,
    userId: user?.id || null,
    error: errorMessage,
    stackTrace,
    ...additionalInfo,
  };

  // Log with winston (which will also store in database via PrismaTransport)
  logger.error(message, logData);
}

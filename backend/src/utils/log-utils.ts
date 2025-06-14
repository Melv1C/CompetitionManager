import { prisma } from '@/lib/prisma';
import { Log$, type LogQuery } from '@competition-manager/core/schemas';

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

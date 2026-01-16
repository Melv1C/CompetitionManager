import { prisma } from '@repo/database';
/**
 * Clean old logs (older than specified days)
 */
export async function cleanOldLogs(daysToKeep: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.log.deleteMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

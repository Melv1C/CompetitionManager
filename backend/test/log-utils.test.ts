import { logger } from '@/lib/logger';
import { getUser } from '@/utils/auth-utils';
import { cleanOldLogs, logError, queryLogs } from '@/utils/log-utils';
import type { User } from '@generated/prisma';
import { LogLevel$, UserRole$, type LogQuery } from '@repo/core/schemas';
import type { Context } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to ensure mock objects are available during hoisting
const mockPrismaLog = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
  deleteMany: vi.fn(),
}));

// Mock dependencies
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('@/utils/auth-utils', () => ({
  getUser: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    log: mockPrismaLog,
  },
}));

describe('log-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('queryLogs', () => {
    const mockLogs = [
      {
        id: 1,
        level: 'error',
        message: 'Test error message',
        meta: '{"userId": "123"}',
        timestamp: new Date('2025-06-15T10:00:00Z'),
      },
      {
        id: 2,
        level: 'info',
        message: 'Test info message',
        meta: null,
        timestamp: new Date('2025-06-15T09:00:00Z'),
      },
    ];
    it('should query logs with default parameters', async () => {
      const totalCount = 2;
      mockPrismaLog.count.mockResolvedValue(totalCount);
      mockPrismaLog.findMany.mockResolvedValue(mockLogs);

      const query: LogQuery = {
        levels: LogLevel$.options,
        limit: 20,
        offset: 0,
      };

      const result = await queryLogs(query);

      const expectedWhere = {
        level: {
          in: LogLevel$.options,
        },
      };

      expect(mockPrismaLog.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrismaLog.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { timestamp: 'desc' },
        take: 20,
        skip: 0,
      });

      expect(result).toEqual({
        logs: mockLogs,
        totalCount: 2,
        hasMore: false,
        page: 1,
        totalPages: 1,
        pageSize: 20,
      });
    });

    it('should filter logs by level', async () => {
      const totalCount = 1;
      mockPrismaLog.count.mockResolvedValue(totalCount);
      mockPrismaLog.findMany.mockResolvedValue([mockLogs[0]]);

      const query: LogQuery = {
        levels: ['error'],
        limit: 20,
        offset: 0,
      };

      await queryLogs(query);

      const expectedWhere = {
        level: {
          in: ['error'],
        },
      };

      expect(mockPrismaLog.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrismaLog.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { timestamp: 'desc' },
        take: 20,
        skip: 0,
      });
    });
    it('should filter logs by date range', async () => {
      const totalCount = 1;
      mockPrismaLog.count.mockResolvedValue(totalCount);
      mockPrismaLog.findMany.mockResolvedValue([mockLogs[0]]);

      const startDate = new Date('2025-06-15T08:00:00Z');
      const endDate = new Date('2025-06-15T11:00:00Z');

      const query: LogQuery = {
        levels: LogLevel$.options,
        startDate,
        endDate,
        limit: 20,
        offset: 0,
      };

      await queryLogs(query);

      const expectedWhere = {
        level: {
          in: LogLevel$.options,
        },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      };

      expect(mockPrismaLog.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrismaLog.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { timestamp: 'desc' },
        take: 20,
        skip: 0,
      });
    });
    it('should filter logs by search term', async () => {
      const totalCount = 1;
      mockPrismaLog.count.mockResolvedValue(totalCount);
      mockPrismaLog.findMany.mockResolvedValue([mockLogs[0]]);

      const query: LogQuery = {
        levels: LogLevel$.options,
        search: 'error',
        limit: 20,
        offset: 0,
      };

      await queryLogs(query);

      const expectedWhere = {
        level: {
          in: LogLevel$.options,
        },
        message: {
          contains: 'error',
          mode: 'insensitive',
        },
      };

      expect(mockPrismaLog.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrismaLog.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { timestamp: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should handle pagination correctly', async () => {
      const totalCount = 100;
      mockPrismaLog.count.mockResolvedValue(totalCount);
      mockPrismaLog.findMany.mockResolvedValue(mockLogs);

      const query: LogQuery = {
        levels: LogLevel$.options,
        limit: 10,
        offset: 20,
      };

      const result = await queryLogs(query);

      expect(result).toEqual({
        logs: mockLogs,
        totalCount: 100,
        hasMore: true,
        page: 3,
        totalPages: 10,
        pageSize: 10,
      });
    });

    it('should combine multiple filters', async () => {
      const totalCount = 1;
      mockPrismaLog.count.mockResolvedValue(totalCount);
      mockPrismaLog.findMany.mockResolvedValue([mockLogs[0]]);

      const startDate = new Date('2025-06-15T08:00:00Z');
      const endDate = new Date('2025-06-15T11:00:00Z');

      const query: LogQuery = {
        levels: ['error', 'warn'],
        startDate,
        endDate,
        search: 'test',
        limit: 5,
        offset: 10,
      };

      await queryLogs(query);

      const expectedWhere = {
        level: {
          in: ['error', 'warn'],
        },
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        message: {
          contains: 'test',
          mode: 'insensitive',
        },
      };

      expect(mockPrismaLog.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrismaLog.findMany).toHaveBeenCalledWith({
        where: expectedWhere,
        orderBy: { timestamp: 'desc' },
        take: 5,
        skip: 10,
      });
    });
  });

  describe('cleanOldLogs', () => {
    it('should clean logs older than default 30 days', async () => {
      const deletedCount = 5;
      mockPrismaLog.deleteMany.mockResolvedValue({ count: deletedCount });

      const result = await cleanOldLogs();

      expect(result).toBe(deletedCount);
      expect(mockPrismaLog.deleteMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            lt: expect.any(Date),
          },
        },
      });

      // Verify the cutoff date is approximately 30 days ago
      const callArgs = mockPrismaLog.deleteMany.mock.calls[0][0];
      const cutoffDate = callArgs.where.timestamp.lt;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Allow for small time differences (within 1 minute)
      expect(
        Math.abs(cutoffDate.getTime() - thirtyDaysAgo.getTime())
      ).toBeLessThan(60000);
    });

    it('should clean logs older than specified days', async () => {
      const deletedCount = 10;
      const daysToKeep = 7;
      mockPrismaLog.deleteMany.mockResolvedValue({ count: deletedCount });

      const result = await cleanOldLogs(daysToKeep);

      expect(result).toBe(deletedCount);
      expect(mockPrismaLog.deleteMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            lt: expect.any(Date),
          },
        },
      });

      // Verify the cutoff date is approximately 7 days ago
      const callArgs = mockPrismaLog.deleteMany.mock.calls[0][0];
      const cutoffDate = callArgs.where.timestamp.lt;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Allow for small time differences (within 1 minute)
      expect(
        Math.abs(cutoffDate.getTime() - sevenDaysAgo.getTime())
      ).toBeLessThan(60000);
    });

    it('should return 0 when no logs are deleted', async () => {
      mockPrismaLog.deleteMany.mockResolvedValue({ count: 0 });

      const result = await cleanOldLogs(30);

      expect(result).toBe(0);
    });
  });

  describe('logError', () => {
    const mockContext = {
      req: {
        method: 'POST',
        path: '/api/test',
      },
    } as Context;

    const mockUser = {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
      role: UserRole$.enum.user,
    };

    beforeEach(() => {
      vi.mocked(getUser).mockResolvedValue(mockUser as User);
    });

    it('should log error with user context', async () => {
      const error = new Error('Test error message');
      const message = 'Something went wrong';
      const additionalInfo = { requestId: 'req123' };

      await logError(message, error, mockContext, additionalInfo);

      expect(getUser).toHaveBeenCalledWith(mockContext);
      expect(logger.error).toHaveBeenCalledWith(message, {
        method: 'POST',
        path: '/api/test',
        userId: 'user123',
        error: 'Test error message',
        stackTrace: error.stack,
        requestId: 'req123',
      });
    });

    it('should log error without user context', async () => {
      vi.mocked(getUser).mockResolvedValue(null);

      const error = new Error('Test error message');
      const message = 'Something went wrong';

      await logError(message, error, mockContext);

      expect(getUser).toHaveBeenCalledWith(mockContext);
      expect(logger.error).toHaveBeenCalledWith(message, {
        method: 'POST',
        path: '/api/test',
        userId: null,
        error: 'Test error message',
        stackTrace: error.stack,
      });
    });

    it('should handle unknown error types', async () => {
      const error = { someProperty: 'value' };
      const message = 'Something went wrong';

      await logError(message, error, mockContext);

      expect(logger.error).toHaveBeenCalledWith(message, {
        method: 'POST',
        path: '/api/test',
        userId: 'user123',
        error: 'Unknown error',
        stackTrace: undefined,
      });
    });

    it('should handle getUser throwing an error', async () => {
      vi.mocked(getUser).mockRejectedValue(new Error('Auth error'));

      const error = new Error('Test error message');
      const message = 'Something went wrong';

      // Should not throw, but should still log the original error
      await expect(logError(message, error, mockContext)).rejects.toThrow(
        'Auth error'
      );
    });

    it('should merge additional info correctly', async () => {
      const error = new Error('Test error message');
      const message = 'Something went wrong';
      const additionalInfo = {
        requestId: 'req123',
        traceId: 'trace456',
        metadata: { foo: 'bar' },
      };

      await logError(message, error, mockContext, additionalInfo);

      expect(logger.error).toHaveBeenCalledWith(message, {
        method: 'POST',
        path: '/api/test',
        userId: 'user123',
        error: 'Test error message',
        stackTrace: error.stack,
        requestId: 'req123',
        traceId: 'trace456',
        metadata: { foo: 'bar' },
      });
    });
  });
});

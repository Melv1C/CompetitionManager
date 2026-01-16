import { apiClient } from '@/lib/api-client';
import type { Log, LogFilter, LogWithUser, PaginatedLogs } from '@repo/utils';
import { useQuery } from '@tanstack/react-query';

function parseLogDates(log: Omit<Log, 'createdAt'> & { createdAt: string }): Log {
  return {
    ...log,
    createdAt: new Date(log.createdAt),
  };
}

function parseLogWithUserDates(
  log: Omit<LogWithUser, 'createdAt'> & { createdAt: string },
): LogWithUser {
  return {
    ...log,
    createdAt: new Date(log.createdAt),
  };
}

const LOGS_STALE_TIME = 30000; // 30 seconds
const LOGS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export function useLogs(filter: Partial<LogFilter> = {}) {
  return useQuery({
    queryKey: ['logs', filter],
    queryFn: async (): Promise<PaginatedLogs> => {
      const res = await apiClient.api.logs.$get({
        query: {
          page: filter.page?.toString(),
          pageSize: filter.pageSize?.toString(),
          types: filter.types?.join(','),
          levels: filter.levels?.join(','),
          search: filter.search,
          startDate: filter.startDate?.toISOString(),
          endDate: filter.endDate?.toISOString(),
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch logs: ${errorText || res.statusText}`);
      }

      const result = await res.json();
      return {
        data: result.data.map(parseLogDates),
        pagination: result.pagination,
      };
    },
    placeholderData: previousData => previousData,
    staleTime: LOGS_STALE_TIME,
    gcTime: LOGS_CACHE_TIME,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useLog(id: number | null) {
  return useQuery({
    queryKey: ['log', id],
    queryFn: async (): Promise<LogWithUser> => {
      if (!id) throw new Error('No log ID provided');

      const res = await apiClient.api.logs[':id'].$get({ param: { id: id.toString() } });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch log: ${errorText || res.statusText}`);
      }

      const log = await res.json();
      return parseLogWithUserDates(log);
    },
    enabled: id !== null,
    staleTime: LOGS_STALE_TIME,
    gcTime: LOGS_CACHE_TIME,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

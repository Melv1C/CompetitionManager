import { type LogQuery } from '@competition-manager/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LogService } from '../services/log-service';

export const LOG_QUERY_KEY = 'logs';

export function useLogs(query: LogQuery) {
  return useQuery({
    queryKey: [LOG_QUERY_KEY, query],
    queryFn: () => LogService.getLogs(query),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

export function useLogCleanup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => LogService.cleanupLogs(),
    onSuccess: () => {
      toast.success('Logs cleanup successful triggered');
      // Invalidate logs query to refresh the list
      queryClient.invalidateQueries({ queryKey: [LOG_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Log cleanup failed:', error);
      toast.error('Failed to cleanup logs. Please try again.');
    },
  });
}

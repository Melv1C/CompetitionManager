import { ATHLETES_QUERY_KEY } from '@/lib/query-keys';
import { AthletesService } from '@/services';
import type { AthleteBestPerformancesResponse } from '@repo/core/schemas';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const PERFORMANCES_KEY = 'performances';

export function useAthleteBestPerformances(
  license: string | undefined,
  options?: { fromDate?: string; enabled?: boolean },
) {
  return useQuery<AthleteBestPerformancesResponse>({
    queryKey: [ATHLETES_QUERY_KEY, PERFORMANCES_KEY, license, options?.fromDate],
    queryFn: () => AthletesService.getBestPerformances(license!, { fromDate: options?.fromDate }),
    enabled: (options?.enabled ?? true) && Boolean(license),
    staleTime: 1000 * 60 * 30, // 30 minutes - performances don't change often
  });
}

export function usePrefetchAthleteBestPerformances() {
  const queryClient = useQueryClient();

  const prefetch = (license: string, fromDate?: string) => {
    queryClient.prefetchQuery({
      queryKey: [ATHLETES_QUERY_KEY, PERFORMANCES_KEY, license, fromDate],
      queryFn: () => AthletesService.getBestPerformances(license, { fromDate }),
      staleTime: 1000 * 60 * 30, // 30 minutes
    });
  };

  return { prefetch };
}

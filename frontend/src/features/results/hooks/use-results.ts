import { RESULTS_QUERY_KEY } from '@/lib/query-keys';
import { ResultsService } from '@/services';
import type { Cuid } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to get all results for a competition with real-time updates via socket
 */
export function useResults(competitionEid: Cuid) {
  return useQuery({
    queryKey: [RESULTS_QUERY_KEY, competitionEid],
    queryFn: () => ResultsService.getResults(competitionEid),
  });
}

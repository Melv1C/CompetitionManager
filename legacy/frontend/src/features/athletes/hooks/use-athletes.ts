import { ATHLETES_QUERY_KEY } from '@/lib/query-keys';
import { AthletesService } from '@/services';
import type { AthleteKey } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';

export function useSearchAthletes(key: AthleteKey, enabled: boolean = true) {
  return useQuery({
    queryKey: [ATHLETES_QUERY_KEY, 'search', key],
    queryFn: () => AthletesService.searchAthletes(key),
    enabled: enabled && key.trim().length > 0,
  });
}

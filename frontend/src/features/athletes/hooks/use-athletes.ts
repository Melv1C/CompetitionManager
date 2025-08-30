import { AthletesService } from '@/services';
import type { AthleteKey } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';

export const ATHLETES_QUERY_KEY = 'athletes';

export function useSearchAthletes(key: AthleteKey, enabled: boolean = true) {
  return useQuery({
    queryKey: [ATHLETES_QUERY_KEY, 'search', key],
    queryFn: () => AthletesService.searchAthletes(key),
    enabled: enabled && key.trim().length > 0,
  });
}

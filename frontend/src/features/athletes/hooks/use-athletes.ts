import type { AthleteKey } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';
import { AthletesService } from '../services/athletes-service';

export const ATHLETES_QUERY_KEY = 'athletes';

export function useSearchAthletes(key: AthleteKey, enabled: boolean = true) {
  return useQuery({
    queryKey: [ATHLETES_QUERY_KEY, 'search', key],
    queryFn: () => AthletesService.searchAthletes(key),
    enabled: enabled && key.trim().length > 0,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}

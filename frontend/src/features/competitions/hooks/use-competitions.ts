import type { Competition, CompetitionQuery } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';
import { CompetitionsService } from '../services/competitions-service';

export const COMPETITIONS_QUERY_KEY = 'competitions';

export function useCompetitions(query?: Partial<CompetitionQuery>) {
  return useQuery<Competition[]>({
    queryKey: [COMPETITIONS_QUERY_KEY, query],
    queryFn: () => CompetitionsService.getCompetitions(query),
  });
}

export function useCompetition(eid?: string) {
  return useQuery<Competition | undefined>({
    queryKey: [COMPETITIONS_QUERY_KEY, 'detail', eid],
    queryFn: () =>
      eid
        ? CompetitionsService.getCompetition(eid)
        : Promise.resolve(undefined),
    enabled: Boolean(eid),
  });
}

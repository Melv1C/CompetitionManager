import type { CompetitionQuery } from '@repo/core/schemas';
import { CompetitionsService } from '../services/competitions-service';
import { useSuspenseQuery } from '@tanstack/react-query';

export const COMPETITIONS_QUERY_KEY = 'competitions';

export function useCompetitions(query?: Partial<CompetitionQuery>) {
  return useSuspenseQuery({
    queryKey: [COMPETITIONS_QUERY_KEY, query],
    queryFn: () => CompetitionsService.getCompetitions(query),
  });
}

export function useCompetition(eid: string) {
  return useSuspenseQuery({
    queryKey: [COMPETITIONS_QUERY_KEY, 'detail', eid],
    queryFn: () =>
      eid
        ? CompetitionsService.getCompetition(eid)
        : Promise.resolve(undefined),
  });
}

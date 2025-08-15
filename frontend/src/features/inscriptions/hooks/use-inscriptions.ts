import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { InscriptionsService } from '../services/inscriptions-service';
import type { Cuid, UpsertInscriptions } from '@repo/core/schemas';

export const INSCRIPTIONS_QUERY_KEY = 'inscriptions';

export function useCompetitionInscriptions(competitionEid: Cuid) {
  return useSuspenseQuery({
    queryKey: [INSCRIPTIONS_QUERY_KEY, competitionEid],
    queryFn: () => InscriptionsService.getCompetitionInscriptions(competitionEid),
  });
}

export function useCreateInscriptions(competitionEid: Cuid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inscriptions }: { inscriptions: UpsertInscriptions }) =>
      InscriptionsService.createInscriptions(competitionEid, inscriptions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INSCRIPTIONS_QUERY_KEY, competitionEid],
      });
    },
  });
}

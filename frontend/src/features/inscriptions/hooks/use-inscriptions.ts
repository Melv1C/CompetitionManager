import { InscriptionsService } from '@/services';
import type { Cuid, UpsertInscriptions } from '@repo/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const INSCRIPTIONS_QUERY_KEY = 'inscriptions';

export function useCompetitionInscriptions(competitionEid: Cuid) {
  return useQuery({
    queryKey: [INSCRIPTIONS_QUERY_KEY, competitionEid],
    queryFn: () => InscriptionsService.getCompetitionInscriptions(competitionEid),
  });
}

export function useCreateInscriptions(competitionEid: Cuid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inscriptions }: { inscriptions: UpsertInscriptions }) =>
      InscriptionsService.createInscriptions(competitionEid, inscriptions),
    onSuccess: result => {
      if (result.type === 'payment') {
        window.location.href = result.url;
      }
      if (result.type === 'inscription') {
        queryClient.invalidateQueries({
          queryKey: [INSCRIPTIONS_QUERY_KEY, competitionEid],
        });
      }
    },
  });
}

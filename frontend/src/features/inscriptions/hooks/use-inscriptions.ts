import {
  ACTIVE_USER_QUERY_KEY,
  ALREADY_PAID_QUERY_KEY,
  INSCRIPTIONS_QUERY_KEY,
} from '@/lib/query-keys';
import { InscriptionsService } from '@/services';
import type { Cuid, Id, UpsertInscriptions } from '@repo/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function useCompetitionInscriptions(competitionEid: Cuid) {
  return useQuery({
    queryKey: [INSCRIPTIONS_QUERY_KEY, competitionEid],
    queryFn: () => InscriptionsService.getInscriptions(competitionEid),
  });
}

export function useRequiredCompetitionInscriptions(eid: Cuid) {
  const { t } = useTranslation();
  const inscriptions = useCompetitionInscriptions(eid);

  if (inscriptions.isPending) {
    throw new Error(t('messages:loading.inscriptions'));
  }

  if (inscriptions.isError) {
    throw new Error(t('messages:error.inscriptions'));
  }

  return inscriptions.data;
}

export function useCreateInscriptions(competitionEid: Cuid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inscriptions }: { inscriptions: UpsertInscriptions }) =>
      InscriptionsService.createInscriptions(competitionEid, inscriptions),
    onSuccess: result => {
      if (result.type === 'inscription') {
        queryClient.invalidateQueries({
          queryKey: [INSCRIPTIONS_QUERY_KEY, competitionEid],
        });
        queryClient.invalidateQueries({
          queryKey: [INSCRIPTIONS_QUERY_KEY, ACTIVE_USER_QUERY_KEY],
        });
      }
    },
    onError: error => {
      console.error('Error creating inscriptions:', error);
      toast.error(error.message);
    },
  });
}

export function useUserInscriptions() {
  return useQuery({
    queryKey: [INSCRIPTIONS_QUERY_KEY, ACTIVE_USER_QUERY_KEY],
    queryFn: InscriptionsService.getUserInscriptions,
  });
}

export function useAlreadyPaidAmounts(competitionId: Id, athleteIds: Id[]) {
  return useQuery({
    queryKey: [ALREADY_PAID_QUERY_KEY, competitionId, athleteIds],
    queryFn: () => InscriptionsService.getAlreadyPaidAmounts(competitionId, athleteIds),
  });
}

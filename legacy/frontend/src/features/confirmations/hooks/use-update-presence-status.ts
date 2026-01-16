import { ACTIVE_ORGANIZATION_QUERY_KEY, INSCRIPTIONS_QUERY_KEY } from '@/lib/query-keys';
import { ConfirmationsService } from '@/services';
import type { Cuid, Id, PresenceStatus } from '@repo/core/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdatePresenceStatus = (competitionEid: Cuid) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      inscriptionIds,
      presenceStatus,
    }: {
      inscriptionIds: Id[];
      presenceStatus: PresenceStatus;
    }) => ConfirmationsService.updatePresenceStatus(competitionEid, inscriptionIds, presenceStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INSCRIPTIONS_QUERY_KEY, ACTIVE_ORGANIZATION_QUERY_KEY, competitionEid],
      });
    },
  });
};

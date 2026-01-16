import { apiClient } from '@/lib/api-client';
import type { Cuid, Id, PresenceStatus } from '@repo/core/schemas';

export const ConfirmationsService = {
  updatePresenceStatus: async (
    competitionEid: Cuid,
    inscriptionIds: Id[],
    presenceStatus: PresenceStatus,
  ) => {
    const response = await apiClient.put(
      `/api/organization/competitions/${competitionEid}/inscriptions/presence`,
      {
        inscriptionIds,
        presenceStatus,
      },
    );
    return response.data;
  },
};

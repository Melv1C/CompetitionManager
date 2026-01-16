import { ACTIVE_ORGANIZATION_QUERY_KEY, INSCRIPTIONS_QUERY_KEY } from '@/lib/query-keys';
import { InscriptionsService } from '@/services';
import type { Cuid } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';

export const useOrganizationInscriptions = (competitionEid: Cuid) => {
  return useQuery({
    queryKey: [INSCRIPTIONS_QUERY_KEY, ACTIVE_ORGANIZATION_QUERY_KEY, competitionEid],
    queryFn: () => InscriptionsService.getOrganizationInscriptions(competitionEid),
  });
};

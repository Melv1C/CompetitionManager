import type { Competition, Cuid } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';
import { CompetitionsService } from '../services/competitions-service';

export function useOrganizationCompetition(eid: Cuid) {
  return useQuery<Competition>({
    queryKey: ['competition', eid],
    queryFn: () => CompetitionsService.getOrganizationCompetition(eid),
  });
}

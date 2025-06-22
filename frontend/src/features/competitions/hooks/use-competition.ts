import type { Competition } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';
import { CompetitionsService } from '../services/competitions-service';

export function useOrganizationCompetition(id: string) {
  return useQuery<Competition>({
    queryKey: ['competition', id],
    queryFn: () => CompetitionsService.getOrganizationCompetition(id),
  });
}

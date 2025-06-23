import type { Competition, CompetitionUpdate, Cuid } from '@repo/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CompetitionsService } from '../services/competitions-service';

export function useOrganizationCompetition(eid: Cuid) {
  return useQuery<Competition>({
    queryKey: ['competition', eid],
    queryFn: () => CompetitionsService.getOrganizationCompetition(eid),
  });
}

export function useUpdateOrganizationCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eid, data }: { eid: Cuid; data: CompetitionUpdate }) =>
      CompetitionsService.updateOrganizationCompetition(eid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['competition', variables.eid] });
      queryClient.invalidateQueries({ queryKey: ['competitions', 'organization'] });
    },
  });
}

import type { Competition, CompetitionUpdate, Cuid } from '@repo/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CompetitionsService } from '../services/competitions-service';

export const ORGANIZATION_COMPETITIONS_QUERY_KEY = 'organizationCompetitions';

export function useOrganizationCompetitions() {
  return useQuery<Competition[]>({
    queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY],
    queryFn: CompetitionsService.getOrganizationCompetitions,
  });
}

export function useOrganizationCompetition(eid: Cuid) {
  return useQuery<Competition>({
    queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY, eid],
    queryFn: () => CompetitionsService.getOrganizationCompetition(eid),
  });
}

export function useUpdateCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eid, data }: { eid: Cuid; data: CompetitionUpdate }) =>
      CompetitionsService.updateOrganizationCompetition(eid, data),
    onSuccess: () => {
      toast.success('Competition updated successfully');
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY],
      });
    },
    onError: error => {
      console.error('Update competition error:', error);
      toast.error('Failed to update competition');
    },
  });
}

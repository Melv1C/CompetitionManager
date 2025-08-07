import type {
  Competition,
  CompetitionCreate,
  CompetitionUpdate,
  Cuid,
} from '@repo/core/schemas';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { CompetitionsService } from '../services/competitions-service';
import { COMPETITIONS_QUERY_KEY } from './use-competitions';

export const ORGANIZATION_COMPETITIONS_QUERY_KEY = 'organizationCompetitions';

export function useOrganizationCompetitions() {
  return useSuspenseQuery<Competition[]>({
    queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY],
    queryFn: CompetitionsService.getOrganizationCompetitions,
  });
}

export function useOrganizationCompetition(eid: Cuid) {
  return useSuspenseQuery<Competition>({
    queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY, eid],
    queryFn: () => CompetitionsService.getOrganizationCompetition(eid),
  });
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompetitionCreate) =>
      CompetitionsService.createCompetition(data),
    onSuccess: () => {
      toast.success('Competition created successfully');
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [COMPETITIONS_QUERY_KEY],
      });
    },
    onError: (error) => {
      console.error('Create competition error:', error);
      toast.error('Failed to create competition');
    },
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
      queryClient.invalidateQueries({
        queryKey: [COMPETITIONS_QUERY_KEY],
      });
    },
    onError: (error) => {
      console.error('Update competition error:', error);
      toast.error('Failed to update competition');
    },
  });
}

import { CompetitionsService } from '@/services';
import type { CompetitionCreate, CompetitionUpdate, Cuid } from '@repo/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { COMPETITIONS_QUERY_KEY } from './use-competitions';

export const ORGANIZATION_COMPETITIONS_QUERY_KEY = 'organizationCompetitions';

export function useOrganizationCompetitions() {
  return useQuery({
    queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY],
    queryFn: CompetitionsService.getOrganizationCompetitions,
  });
}

export function useOrganizationCompetition(eid: Cuid) {
  return useQuery({
    queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY, eid],
    queryFn: () => CompetitionsService.getOrganizationCompetition(eid),
  });
}

export function useRequiredOrganizationCompetition(eid: Cuid) {
  const { t } = useTranslation();
  const competition = useOrganizationCompetition(eid);
  if (competition.isPending) {
    throw new Error(t('loading.competition'));
  }

  if (competition.isError) {
    throw new Error(t('error.competition'));
  }

  return competition.data;
}

export function useCreateCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompetitionCreate) => CompetitionsService.createCompetition(data),
    onSuccess: () => {
      toast.success('Competition created successfully');
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [COMPETITIONS_QUERY_KEY],
      });
    },
    onError: error => {
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
    onError: error => {
      console.error('Update competition error:', error);
      toast.error('Failed to update competition');
    },
  });
}

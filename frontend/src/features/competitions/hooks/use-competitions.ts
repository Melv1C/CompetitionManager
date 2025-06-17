import type { Competition, CompetitionCreate } from '@competition-manager/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CompetitionsService } from '../services/competitions-service';

export const COMPETITIONS_QUERY_KEY = 'competitions';

export function useCreateCompetition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompetitionCreate) =>
      CompetitionsService.createCompetition(data),
    onSuccess: () => {
      toast.success('Competition created successfully');
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Create competition error:', error);
      toast.error('Failed to create competition');
    },
  });
}

export function useCompetitions() {
  return useQuery<Competition[]>({
    queryKey: [COMPETITIONS_QUERY_KEY],
    queryFn: CompetitionsService.getCompetitions,
  });
}

export function useOrganizationCompetitions() {
  return useQuery<Competition[]>({
    queryKey: [COMPETITIONS_QUERY_KEY, 'organization'],
    queryFn: CompetitionsService.getOrganizationCompetitions,
  });
}

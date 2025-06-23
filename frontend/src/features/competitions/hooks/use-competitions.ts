import type { Competition, CompetitionCreate, CompetitionQuery } from '@repo/core/schemas';
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

export function useCompetitions(query?: Partial<CompetitionQuery>) {
  return useQuery<Competition[]>({
    queryKey: [COMPETITIONS_QUERY_KEY, query],
    queryFn: () => CompetitionsService.getCompetitions(query),
  });
}

export function useCompetition(eid?: string) {
  return useQuery<Competition | undefined>({
    queryKey: [COMPETITIONS_QUERY_KEY, 'detail', eid],
    queryFn: () => (eid ? CompetitionsService.getCompetition(eid) : Promise.resolve(undefined)),
    enabled: Boolean(eid),
  });
}

export function useOrganizationCompetitions() {
  return useQuery<Competition[]>({
    queryKey: [COMPETITIONS_QUERY_KEY, 'organization'],
    queryFn: CompetitionsService.getOrganizationCompetitions,
  });
}

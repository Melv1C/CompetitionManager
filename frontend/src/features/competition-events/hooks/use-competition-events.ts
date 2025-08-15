import type { CompetitionEventCreate, CompetitionEventUpdate, Cuid } from '@repo/core/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CompetitionEventsService } from '../services/competition-events-service';
import {
  COMPETITIONS_QUERY_KEY,
  ORGANIZATION_COMPETITIONS_QUERY_KEY,
} from '@/features/competitions';

export function useCreateCompetitionEvent(competitionEid: Cuid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompetitionEventCreate) =>
      CompetitionEventsService.createCompetitionEvent(competitionEid, data),
    onSuccess: () => {
      toast.success('Competition event created successfully');
      queryClient.invalidateQueries({
        queryKey: [COMPETITIONS_QUERY_KEY, competitionEid],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY, competitionEid],
      });
    },
    onError: error => {
      console.error('Create competition event error:', error);
      toast.error('Failed to create competition event');
    },
  });
}

export function useUpdateCompetitionEvent(competitionEid: Cuid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventEid, data }: { eventEid: Cuid; data: CompetitionEventUpdate }) =>
      CompetitionEventsService.updateCompetitionEvent(competitionEid, eventEid, data),
    onSuccess: () => {
      toast.success('Competition event updated successfully');
      queryClient.invalidateQueries({
        queryKey: [COMPETITIONS_QUERY_KEY, competitionEid],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY, competitionEid],
      });
    },
    onError: error => {
      console.error('Update competition event error:', error);
      toast.error('Failed to update competition event');
    },
  });
}

export function useDeleteCompetitionEvent(competitionEid: Cuid) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventEid: Cuid) =>
      CompetitionEventsService.deleteCompetitionEvent(competitionEid, eventEid),
    onSuccess: () => {
      toast.success('Competition event deleted successfully');
      queryClient.invalidateQueries({
        queryKey: [COMPETITIONS_QUERY_KEY, competitionEid],
      });
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_COMPETITIONS_QUERY_KEY, competitionEid],
      });
    },
    onError: error => {
      console.error('Delete competition event error:', error);
      toast.error('Failed to delete competition event');
    },
  });
}

import type { CompetitionCreate } from '@competition-manager/core/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CompetitionsService } from '../services/competitions-service';

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

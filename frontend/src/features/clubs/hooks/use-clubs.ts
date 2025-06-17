import type { ClubCreate, ClubUpdate } from '@competition-manager/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClubsService } from '../services/clubs-service';

export const CLUBS_QUERY_KEY = 'clubs';

export function useClubs() {
  return useQuery({
    queryKey: [CLUBS_QUERY_KEY],
    queryFn: ClubsService.getClubs,
  });
}

export function useClub(id: number) {
  return useQuery({
    queryKey: [CLUBS_QUERY_KEY, id],
    queryFn: () => ClubsService.getClub(id),
    enabled: !!id,
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClubCreate) => ClubsService.createClub(data),
    onSuccess: () => {
      toast.success('Club created successfully');
      queryClient.invalidateQueries({ queryKey: [CLUBS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Create club error:', error);
      toast.error('Failed to create club');
    },
  });
}

export function useUpdateClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClubUpdate }) =>
      ClubsService.updateClub(id, data),
    onSuccess: () => {
      toast.success('Club updated successfully');
      queryClient.invalidateQueries({ queryKey: [CLUBS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Update club error:', error);
      toast.error('Failed to update club');
    },
  });
}

export function useDeleteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ClubsService.deleteClub(id),
    onSuccess: () => {
      toast.success('Club deleted successfully');
      queryClient.invalidateQueries({ queryKey: [CLUBS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Delete club error:', error);
      toast.error('Failed to delete club');
    },
  });
}

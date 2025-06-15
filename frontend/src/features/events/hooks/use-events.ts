import type {
  EventCreate,
  EventUpdate,
} from '@competition-manager/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EventsService } from '../services/events-service';

export const EVENTS_QUERY_KEY = 'events';

export function useEvents() {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY],
    queryFn: EventsService.getEvents,
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, id],
    queryFn: () => EventsService.getEvent(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventCreate) => EventsService.createEvent(data),
    onSuccess: () => {
      toast.success('Event created successfully');
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Create event error:', error);
      toast.error('Failed to create event');
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EventUpdate }) =>
      EventsService.updateEvent(id, data),
    onSuccess: () => {
      toast.success('Event updated successfully');
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Update event error:', error);
      toast.error('Failed to update event');
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => EventsService.deleteEvent(id),
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Delete event error:', error);
      toast.error('Failed to delete event');
    },
  });
}

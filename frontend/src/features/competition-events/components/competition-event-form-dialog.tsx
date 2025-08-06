import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EventSelector } from '@/features/events/components/event-selector';
import { CategorySelector, useCategories } from '@/features/categories';
import { useEvents } from '@/features/events/hooks/use-events';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CompetitionEvent,
  CompetitionEventCreate,
  CompetitionEventUpdate,
  Cuid,
} from '@repo/core/schemas';
import {
  CompetitionEventCreate$,
  CompetitionEventUpdate$,
} from '@repo/core/schemas';
import { useForm } from 'react-hook-form';
import {
  useCreateCompetitionEvent,
  useUpdateCompetitionEvent,
} from '../hooks/use-competition-events';
import z from 'zod/v4';
import { DateTimePicker } from '@/components/date-time-picker';
import { useOrganizationCompetition } from '@/features/competitions';

interface CompetitionEventFormDialogProps {
  competitionEid: Cuid;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionEvent?: CompetitionEvent;
}

export function CompetitionEventFormDialog({
  competitionEid,
  open,
  onOpenChange,
  competitionEvent,
}: CompetitionEventFormDialogProps) {
  const competition = useOrganizationCompetition(competitionEid);

  const isEditing = !!competitionEvent;
  const createMutation = useCreateCompetitionEvent(competitionEid);
  const updateMutation = useUpdateCompetitionEvent(competitionEid);

  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const form = useForm<CompetitionEventCreate | CompetitionEventUpdate>({
    resolver: zodResolver(
      isEditing
        ? CompetitionEventUpdate$.extend({
            eventStartTime: z.date(),
            categoryIds: z.array(z.number()),
          })
        : CompetitionEventCreate$.extend({
            eventStartTime: z.date(),
            categoryIds: z.array(z.number()),
          })
    ),
    defaultValues: {
      name: competitionEvent?.name ?? '',
      eventId: competitionEvent?.eventId ?? undefined,
      eventStartTime: competitionEvent?.eventStartTime ?? undefined,
      maxParticipants: competitionEvent?.maxParticipants ?? undefined,
      price: competitionEvent?.price ?? 0,
      categoryIds: competitionEvent?.categories?.map((cat) => cat.id) ?? [],
      // subEvents: competitionEvent
      //   ? competition.data.events
      //       .filter((event) => event.parentId === competitionEvent?.id)
      //       .map((event) => ({
      //         id: event.id,
      //         name: event.name,
      //         eventStartTime: event.eventStartTime,
      //         eventId: event.eventId,
      //       }))
      //   : [],
    },
  });

  const onSubmit = async (
    data: CompetitionEventCreate | CompetitionEventUpdate
  ) => {
    if (isEditing && competitionEvent) {
      await updateMutation.mutateAsync({
        eventEid: competitionEvent.eid,
        data: data as CompetitionEventUpdate,
      });
    } else {
      await createMutation.mutateAsync(data as CompetitionEventCreate);
    }
    form.reset();
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[800px] lg:max-w-[900px] max-h-[90vh] w-[95vw]"
        onInteractOutside={(e) => {
          // Prevent closing the dialog when clicking outside
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Competition Event' : 'Create Competition Event'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event</FormLabel>
                  <FormControl>
                    <EventSelector
                      events={events}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select an event"
                      disabled={eventsLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <CategorySelector
                      categories={categories}
                      selectedIds={field.value}
                      onSelectionChange={field.onChange}
                      disabled={categoriesLoading || isLoading}
                      placeholder="Select categories"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Competition Event Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter competition event name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                        placeholder="Select start time"
                        disabled={isLoading}
                        minDate={competition.data.startDate}
                        maxDate={competition.data.endDate || undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Participants (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Leave empty for unlimited"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? Number(value) : undefined);
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Event'
                  : 'Create Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

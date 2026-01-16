import { CategorySelector } from '@/features/categories';
import { EventSelector, useEvents } from '@/features/events';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CompetitionEventCreate$,
  CompetitionEventSubEvent$,
  CompetitionEventUpdate$,
  type CompetitionEvent,
  type CompetitionEventCreate,
  type CompetitionEventUpdate,
  type Cuid,
  type Event,
} from '@repo/core/schemas';
import { getCombinedEventSubEventsCount } from '@repo/core/utils';
import {
  Button,
  DateTimePicker,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  ScrollArea,
} from '@repo/ui';
import { useFieldArray, useForm } from 'react-hook-form';

import { useRequiredOrganizationCompetition } from '@/features/competitions';
import { useEffect, useState } from 'react';
import z from 'zod';
import {
  useCreateCompetitionEvent,
  useUpdateCompetitionEvent,
} from '../../hooks/use-competition-events';
import { SubEventsSection } from './sub-events-section';

export type CompetitionEventFormDialogProps = {
  competitionEid: Cuid;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionEvent?: CompetitionEvent;
};

export function CompetitionEventFormDialog({
  competitionEid,
  open,
  onOpenChange,
  competitionEvent,
}: CompetitionEventFormDialogProps) {
  const competition = useRequiredOrganizationCompetition(competitionEid);

  const isEditing = !!competitionEvent;
  const createMutation = useCreateCompetitionEvent(competitionEid);
  const updateMutation = useUpdateCompetitionEvent(competitionEid);

  const events = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  const form = useForm<CompetitionEventCreate | CompetitionEventUpdate>({
    resolver: zodResolver(
      isEditing
        ? CompetitionEventUpdate$.extend({
            eventStartTime: z.date(),
            categoryIds: z.array(z.number()),
            subEvents: z
              .array(
                CompetitionEventSubEvent$.extend({
                  eventStartTime: z.date(),
                }),
              )
              .optional(),
          })
        : CompetitionEventCreate$.extend({
            eventStartTime: z.date(),
            categoryIds: z.array(z.number()),
            subEvents: z
              .array(
                CompetitionEventSubEvent$.extend({
                  eventStartTime: z.date(),
                }),
              )
              .optional(),
          }),
    ),
    defaultValues: {
      name: competitionEvent?.name ?? '',
      eventId: competitionEvent?.eventId ?? undefined,
      eventStartTime: competitionEvent?.eventStartTime ?? undefined,
      maxParticipants: competitionEvent?.maxParticipants ?? undefined,
      price: competitionEvent?.price ?? 0,
      categoryIds: competitionEvent?.categories?.map(cat => cat.id) ?? [],
      subEvents: competitionEvent
        ? (competition.events
            .filter(event => event.parentId === competitionEvent?.id)
            .map(event => ({
              id: event.id,
              name: event.name,
              eventStartTime: event.eventStartTime,
              eventId: event.eventId,
            })) ?? [])
        : [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'subEvents',
  });

  // Watch for event selection changes
  const watchedEventId = form.watch('eventId');

  useEffect(() => {
    if (watchedEventId) {
      const event = events.data?.find(e => e.id === watchedEventId);
      setSelectedEvent(event);

      // If it's a combined event, auto-generate sub-events
      if (event?.group === 'combined') {
        const subEventsCount = getCombinedEventSubEventsCount(event.name);
        const newSubEvents = Array.from({ length: subEventsCount }, (_, index) => ({
          id: null,
          name: `${event.name} - Event ${index + 1}`,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        replace(newSubEvents as any[]);
      } else {
        // Clear sub-events for non-combined events
        replace([]);
      }
    }
  }, [watchedEventId, events.data, replace]);

  const isCombinedEvent = selectedEvent?.group === 'combined';
  const subEventsCount = isCombinedEvent ? getCombinedEventSubEventsCount(selectedEvent.name) : 0;

  const onSubmit = async (data: CompetitionEventCreate | CompetitionEventUpdate) => {
    // Convert form data to API format
    const apiData = {
      name: data.name,
      eventId: data.eventId,
      eventStartTime: data.eventStartTime,
      maxParticipants: data.maxParticipants,
      price: data.price,
      categoryIds: data.categoryIds,
      subEvents: data.subEvents,
    };

    if (isEditing && competitionEvent) {
      await updateMutation.mutateAsync({
        eventEid: competitionEvent.eid,
        data: apiData as CompetitionEventUpdate,
      });
    } else {
      await createMutation.mutateAsync(apiData as CompetitionEventCreate);
    }
    form.reset();
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (events.isPending) {
    return <div>Loading events...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-6xl max-h-[95vh] w-[90vw]"
        onInteractOutside={e => {
          // Prevent closing the dialog when clicking outside
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Competition Event' : 'Create Competition Event'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-140px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <FormControl>
                        <EventSelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select an event"
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
                          selectedIds={field.value}
                          onSelectionChange={field.onChange}
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
                          <Input placeholder="Enter competition event name" {...field} />
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
                            onChange={date => field.onChange(date)}
                            placeholder="Select start time"
                            disabled={isLoading}
                            minDate={competition.startDate}
                            maxDate={competition.endDate}
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
                            onChange={e => {
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
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Sub-Events Section for Combined Events */}
              {isCombinedEvent && (
                <SubEventsSection
                  control={form.control}
                  fields={fields}
                  isLoading={isLoading}
                  selectedEvent={selectedEvent}
                  subEventsCount={subEventsCount}
                  competitionStartDate={competition.startDate}
                  competitionEndDate={competition.endDate}
                  mainEventStartTime={form.watch('eventStartTime')}
                />
              )}
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

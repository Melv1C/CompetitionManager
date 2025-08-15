import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EventSelector } from '@/features/events/components/event-selector';
import { DateTimePicker } from '@/components/date-time-picker';
import { Separator } from '@/components/ui/separator';
import type { Control, FieldArrayWithId } from 'react-hook-form';
import type { Event, CompetitionEventCreate, CompetitionEventUpdate } from '@repo/core/schemas';
import { useEvents } from '@/features/events/hooks/use-events';

interface SubEventsSectionProps {
  control: Control<CompetitionEventCreate | CompetitionEventUpdate>;
  fields: FieldArrayWithId<CompetitionEventCreate | CompetitionEventUpdate, 'subEvents', 'id'>[];
  isLoading: boolean;
  selectedEvent: Event | undefined;
  subEventsCount: number;
  competitionStartDate?: Date;
  competitionEndDate?: Date;
  mainEventStartTime?: Date;
}

export function SubEventsSection({
  control,
  fields,
  isLoading,
  subEventsCount,
  competitionStartDate,
  competitionEndDate,
}: SubEventsSectionProps) {
  console.log('SubEventsSection rendered', {
    fieldsLength: fields.length,
    subEventsCount,
    competitionStartDate,
    competitionEndDate,
  });
  return (
    <>
      <Separator />
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 h-8 text-sm font-medium">
          <span>
            Sub-Events ({fields.length}/{subEventsCount})
          </span>
        </div>

        <div className="space-y-1 pt-1">
          {/* Header row */}
          <div
            className="grid gap-2 px-1 py-1 text-xs font-medium text-muted-foreground border-b"
            style={{ gridTemplateColumns: '2rem 1fr 1fr 1fr' }}
          >
            <div>#</div>
            <div>Event</div>
            <div>Custom Name</div>
            <div>Start Time</div>
          </div>

          {fields.map((field, index) => (
            <SubEventCard
              key={field.id}
              index={index}
              control={control}
              isLoading={isLoading}
              competitionStartDate={competitionStartDate}
              competitionEndDate={competitionEndDate}
            />
          ))}
        </div>
      </div>
    </>
  );
}

interface SubEventCardProps {
  index: number;
  control: Control<CompetitionEventCreate | CompetitionEventUpdate>;
  isLoading: boolean;
  competitionStartDate?: Date;
  competitionEndDate?: Date;
}

function SubEventCard({
  index,
  control,
  isLoading,
  competitionStartDate,
  competitionEndDate,
}: SubEventCardProps) {
  const events = useEvents();

  return (
    <div
      className="grid gap-2 px-1 py-1 items-center hover:bg-muted/20 rounded-sm"
      style={{ gridTemplateColumns: '2rem 1fr 1fr 1fr' }}
    >
      <div className="text-xs text-muted-foreground font-mono text-center">{index + 1}</div>

      <FormField
        control={control}
        name={`subEvents.${index}.eventId`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <EventSelector
                events={events.data.filter(e => e.group !== 'combined')}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select event"
                excludeCombinedEvents={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`subEvents.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input placeholder="Custom name" {...field} className="text-xs h-8" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`subEvents.${index}.eventStartTime`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <DateTimePicker
                value={field.value}
                onChange={date => field.onChange(date)}
                placeholder="Start time"
                disabled={isLoading}
                minDate={competitionStartDate}
                maxDate={competitionEndDate}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

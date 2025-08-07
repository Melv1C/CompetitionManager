import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CompetitionEvent, Cuid } from '@repo/core/schemas';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteCompetitionEvent } from '../hooks/use-competition-events';
import { CompetitionEventFormDialog } from './competition-event-form-dialog';
import { formatTime, formatDateFull, formatCurrency } from '@/lib/formatters';

interface CompetitionEventsTableProps {
  competitionEid: Cuid;
  competitionEvents: CompetitionEvent[];
}

export function CompetitionEventsTable({
  competitionEid,
  competitionEvents,
}: CompetitionEventsTableProps) {
  const [editingEvent, setEditingEvent] = useState<CompetitionEvent | null>(
    null
  );
  const [showSubEvents, setShowSubEvents] = useState(false);
  const deleteMutation = useDeleteCompetitionEvent(competitionEid);

  const handleDelete = async (eventEid: Cuid) => {
    if (confirm('Are you sure you want to delete this competition event?')) {
      await deleteMutation.mutateAsync(eventEid);
    }
  };

  const handleEdit = (competitionEvent: CompetitionEvent) => {
    // If this is a sub-event (has parentId), find and edit the parent event instead
    if (competitionEvent.parentId) {
      const parentEvent = competitionEvents.find(
        (event) => event.id === competitionEvent.parentId
      );
      if (parentEvent) {
        setEditingEvent(parentEvent);
      }
    } else {
      setEditingEvent(competitionEvent);
    }
  };

  // Filter events based on showSubEvents preference
  const filteredEvents = showSubEvents
    ? competitionEvents
    : competitionEvents.filter((event) => !event.parentId);

  // Group events by day
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const eventDate = new Date(event.eventStartTime);
    const dateKey = eventDate.toDateString(); // Use date string as key

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: eventDate,
        events: [],
      };
    }

    groups[dateKey].events.push(event);
    return groups;
  }, {} as Record<string, { date: Date; events: CompetitionEvent[] }>);

  // Sort groups by date and sort events within each group by time
  const sortedGroups = Object.values(groupedEvents)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((group) => ({
      ...group,
      events: group.events.sort(
        (a, b) =>
          new Date(a.eventStartTime).getTime() -
          new Date(b.eventStartTime).getTime()
      ),
    }));

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No competition events found. Create your first competition event to get
        started.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Show sub-events toggle */}
        <div className="flex items-center space-x-3">
          <Switch
            id="show-sub-events"
            checked={showSubEvents}
            onCheckedChange={setShowSubEvents}
          />
          <label
            htmlFor="show-sub-events"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Show sub-events
          </label>
        </div>

        <div className="space-y-8">
          {sortedGroups.map((group) => (
            <div key={group.date.toDateString()} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                {formatDateFull(group.date)}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.events.map((competitionEvent) => (
                    <TableRow key={competitionEvent.id}>
                      <TableCell>
                        {formatTime(competitionEvent.eventStartTime)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {competitionEvent.name}
                      </TableCell>
                      <TableCell>
                        0
                        {competitionEvent.maxParticipants &&
                          ` / ${competitionEvent.maxParticipants}`}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(competitionEvent.price)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(competitionEvent)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {competitionEvent.parentId
                                ? 'Edit Parent Event'
                                : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(competitionEvent.eid)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </div>

      {!!editingEvent && (
        <CompetitionEventFormDialog
          competitionEid={competitionEid}
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          competitionEvent={editingEvent}
        />
      )}
    </>
  );
}

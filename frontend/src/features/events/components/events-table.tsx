import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Event } from '@repo/core/schemas';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteEvent } from '../hooks/use-events';
import { EventFormDialog } from './event-form-dialog';

interface EventsTableProps {
  events: Event[];
  isLoading: boolean;
}

export function EventsTable({ events, isLoading }: EventsTableProps) {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const deleteMutation = useDeleteEvent();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      sprint: 'bg-red-100 text-red-800',
      middle: 'bg-blue-100 text-blue-800',
      long: 'bg-green-100 text-green-800',
      hurdles: 'bg-purple-100 text-purple-800',
      relay: 'bg-orange-100 text-orange-800',
      jump: 'bg-yellow-100 text-yellow-800',
      throw: 'bg-pink-100 text-pink-800',
      combined: 'bg-gray-100 text-gray-800',
    };
    return colors[group] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      time: 'bg-blue-100 text-blue-800',
      distance: 'bg-green-100 text-green-800',
      height: 'bg-yellow-100 text-yellow-800',
      points: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading events...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Abbreviation</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell>{event.abbr}</TableCell>
              <TableCell>
                <Badge
                  className={getGroupColor(event.group)}
                  variant="secondary"
                >
                  {event.group}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(event.type)} variant="secondary">
                  {event.type}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingEvent(event)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(event.id)}
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

      {!!editingEvent && (
        <EventFormDialog
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          event={editingEvent}
        />
      )}
    </>
  );
}

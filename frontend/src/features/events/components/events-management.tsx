import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useEvents } from '../hooks/use-events';
import { EventFormDialog } from './event-form-dialog';
import { EventsTable } from './events-table';

export function EventsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: events = [], isLoading } = useEvents();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Events ({events.length})</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <EventsTable events={events} isLoading={isLoading} />

      <EventFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

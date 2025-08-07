import { Button } from '@/components/ui/button';
import {
  CompetitionEventsTable,
  CompetitionEventFormDialog,
} from '@/features/competition-events';
import { useOrganizationCompetition } from '@/features/competitions';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export function CompetitionEvents() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { competitionEid } = useParams<{ competitionEid: string }>();
  if (!competitionEid) {
    throw new Error('Competition EID is required');
  }
  const competition = useOrganizationCompetition(competitionEid);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Events</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <CompetitionEventsTable
        competitionEid={competitionEid}
        competitionEvents={competition.data.events}
      />

      <CompetitionEventFormDialog
        competitionEid={competitionEid}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

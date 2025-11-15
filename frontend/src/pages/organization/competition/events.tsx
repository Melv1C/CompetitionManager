import { CompetitionEventFormDialog, CompetitionEventsTable } from '@/features/competition-events';
import { useRequiredOrganizationCompetition } from '@/features/competitions';
import { Button } from '@repo/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export function CompetitionEvents() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { competitionEid } = useParams<{ competitionEid: string }>();
  if (!competitionEid) {
    throw new Error('Competition EID is required');
  }
  const competition = useRequiredOrganizationCompetition(competitionEid);

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
        competitionEvents={competition.events}
      />

      <CompetitionEventFormDialog
        competitionEid={competitionEid}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

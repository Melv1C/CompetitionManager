import { Button } from '@/components/ui/button';
import {
  CreateCompetitionDialog,
  CompetitionsTable,
  useOrganizationCompetitions,
} from '@/features/competitions';
import { useState } from 'react';

export function OrganizationCompetitions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: competitions = [], isLoading } = useOrganizationCompetitions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">
            Manage your organization's competitions and events.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>Create Competition</Button>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <h3 className="font-semibold">Competition List</h3>
          <p className="text-sm text-muted-foreground">
            Manage competitions with their inscriptions, confirmations, results,
            and analytics.
          </p>
        </div>
        <div className="border-t p-4">
          <CompetitionsTable
            competitions={competitions}
            isLoading={isLoading}
          />
        </div>
      </div>

      <CreateCompetitionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

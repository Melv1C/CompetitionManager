import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useClubs } from '../hooks/use-clubs';
import { ClubFormDialog } from './club-form-dialog';
import { ClubsTable } from './clubs-table';

export function ClubsManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: clubs = [], isLoading } = useClubs();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Clubs ({clubs.length})</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Club
        </Button>
      </div>

      <ClubsTable clubs={clubs} isLoading={isLoading} />

      <ClubFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

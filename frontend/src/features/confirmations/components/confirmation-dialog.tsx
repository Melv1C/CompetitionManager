import type { Athlete, Inscription, PresenceStatus } from '@repo/core/schemas';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@repo/ui';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmationStatusSelector } from './confirmation-status-selector';

interface ConfirmationDialogProps {
  athlete: Athlete | null;
  inscriptions: Inscription[];
  open: boolean;
  onClose: () => void;
  onSave: (inscriptionIds: number[], presenceStatus: PresenceStatus) => void;
  isSaving: boolean;
}

export const ConfirmationDialog = ({
  athlete,
  inscriptions,
  open,
  onClose,
  onSave,
  isSaving,
}: ConfirmationDialogProps) => {
  const [statusMap, setStatusMap] = useState<Record<number, PresenceStatus>>({});

  // Detect platform for keyboard shortcuts
  const isMac = useMemo(() => {
    return typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  }, []);
  const modifierKey = isMac ? '⌘' : 'Ctrl+';

  // Sort inscriptions by event start time
  const sortedInscriptions = useMemo(() => {
    return [...inscriptions].sort((a, b) => {
      const timeA = new Date(a.competitionEvent.eventStartTime).getTime();
      const timeB = new Date(b.competitionEvent.eventStartTime).getTime();
      return timeA - timeB;
    });
  }, [inscriptions]);

  const handleStatusChange = (inscriptionId: number, status: PresenceStatus) => {
    setStatusMap(prev => ({ ...prev, [inscriptionId]: status }));
  };

  const handleMarkAll = (status: PresenceStatus) => {
    const newMap: Record<number, PresenceStatus> = {};
    sortedInscriptions.forEach(inscription => {
      newMap[inscription.id] = status;
    });
    setStatusMap(newMap);
  };

  const handleSave = () => {
    const updates = Object.entries(statusMap).reduce(
      (acc, [inscriptionId, status]) => {
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(Number(inscriptionId));
        return acc;
      },
      {} as Record<PresenceStatus, number[]>,
    );

    // Process each status group
    Object.entries(updates).forEach(([status, ids]) => {
      if (ids.length > 0) {
        onSave(ids, status as PresenceStatus);
      }
    });

    // Reset and close
    setStatusMap({});
    onClose();
  };

  const handleClose = () => {
    setStatusMap({});
    onClose();
  };

  // Format event time
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + P: Mark all present
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleMarkAll('PRESENT');
      }
      // Ctrl/Cmd + A: Mark all absent
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        handleMarkAll('ABSENT');
      }
      // Ctrl/Cmd + R: Reset all
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleMarkAll('UNKNOWN');
      }
      // Enter: Save
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isSaving) {
          handleSave();
        }
      }
      // Escape: Close
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, statusMap, isSaving]);

  if (!athlete) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Confirm Presence - {athlete.firstName} {athlete.lastName}
          </DialogTitle>
          <DialogDescription>
            Update the presence status for each event registration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll('PRESENT')}
              type="button"
            >
              Mark All Present <kbd className="ml-2 text-xs">{modifierKey}P</kbd>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll('ABSENT')}
              type="button"
            >
              Mark All Absent <kbd className="ml-2 text-xs">{modifierKey}A</kbd>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAll('UNKNOWN')}
              type="button"
            >
              Reset All <kbd className="ml-2 text-xs">{modifierKey}R</kbd>
            </Button>
          </div>

          <Separator />

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {sortedInscriptions.map(inscription => (
              <div key={inscription.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-muted-foreground">
                      {formatTime(inscription.competitionEvent.eventStartTime)}
                    </div>
                    <div className="font-medium">{inscription.competitionEvent.name}</div>
                  </div>
                </div>
                <ConfirmationStatusSelector
                  value={statusMap[inscription.id] ?? inscription.presenceStatus}
                  onChange={status => handleStatusChange(inscription.id, status)}
                  disabled={isSaving}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}{' '}
            {!isSaving && <kbd className="ml-2 text-xs">Enter</kbd>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

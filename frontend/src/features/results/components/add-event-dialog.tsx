import { useRequiredOrganizationCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import type { CompetitionEvent } from '@repo/core/schemas';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@repo/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEvent: (event: CompetitionEvent) => void;
  excludedEventIds: number[];
}

export function AddEventDialog({
  open,
  onOpenChange,
  onSelectEvent,
  excludedEventIds,
}: AddEventDialogProps) {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const competition = useRequiredOrganizationCompetition(competitionEid);
  const events = competition.events;

  const availableEvents = events?.filter(event => !excludedEventIds.includes(event.id)) ?? [];

  const handleSelectEvent = (event: CompetitionEvent) => {
    onSelectEvent(event);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('results:addEventSheet')}</DialogTitle>
          <DialogDescription>{t('results:selectEventToEncode')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-4">
            {availableEvents.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                {t('results:noEventsAvailable')}
              </p>
            ) : (
              availableEvents.map(event => (
                <Button
                  key={event.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{event.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.event.abbr} • {event.event.type}
                    </span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface AddEventButtonProps {
  onSelectEvent: (event: CompetitionEvent) => void;
  excludedEventIds: number[];
}

export function AddEventButton({ onSelectEvent, excludedEventIds }: AddEventButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
        <Plus className="h-4 w-4" />
        {t('results:addEvent')}
      </Button>
      <AddEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelectEvent={onSelectEvent}
        excludedEventIds={excludedEventIds}
      />
    </>
  );
}

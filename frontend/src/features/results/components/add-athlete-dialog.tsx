import { useOrganizationInscriptions } from '@/features/inscriptions';
import { useCompetitionEid } from '@/hooks';
import type { CompetitionEvent, Inscription } from '@repo/core/schemas';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea,
  Skeleton,
} from '@repo/ui';
import { Loader2, Plus, Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateResult, useOrganizationResults } from '../hooks';

interface AddAthleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CompetitionEvent;
}

export function AddAthleteDialog({ open, onOpenChange, event }: AddAthleteDialogProps) {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: inscriptions, isPending: inscriptionsLoading } =
    useOrganizationInscriptions(competitionEid);
  const { data: results } = useOrganizationResults(competitionEid);
  const createResult = useCreateResult(competitionEid);

  // Get inscriptions for this event
  const eventInscriptions = useMemo(() => {
    return inscriptions?.filter(i => i.competitionEvent.id === event.id) ?? [];
  }, [inscriptions, event.id]);

  // Get athletes already in results for this event
  const existingAthleteIds = useMemo(() => {
    return new Set(
      results?.filter(r => r.competitionEvent.id === event.id).map(r => r.athlete.id) ?? [],
    );
  }, [results, event.id]);

  // Filter inscriptions to exclude athletes already added and apply search
  const availableInscriptions = useMemo(() => {
    return eventInscriptions.filter(inscription => {
      // Exclude already added athletes
      if (existingAthleteIds.has(inscription.athlete.id)) return false;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName =
          `${inscription.athlete.firstName} ${inscription.athlete.lastName}`.toLowerCase();
        const license = inscription.athlete.license?.toLowerCase() ?? '';
        return fullName.includes(query) || license.includes(query);
      }

      return true;
    });
  }, [eventInscriptions, existingAthleteIds, searchQuery]);

  // Calculate the next starting order
  const nextStartingOrder = useMemo(() => {
    const eventResults = results?.filter(r => r.competitionEvent.id === event.id) ?? [];
    if (eventResults.length === 0) return 1;
    return Math.max(...eventResults.map(r => r.startingOrder)) + 1;
  }, [results, event.id]);

  const handleAddAthlete = (inscription: Inscription) => {
    createResult.mutate(
      {
        competitionEventId: event.id,
        athleteId: inscription.athlete.id,
        heatNumber: 1,
        startingOrder: nextStartingOrder,
        inscriptionId: inscription.id,
      },
      {
        onSuccess: () => {
          // Keep dialog open to allow adding more athletes
          setSearchQuery('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('results:addAthlete')}</DialogTitle>
          <DialogDescription>{t('results:selectAthleteToAdd')}</DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('results:searchAthlete')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-4">
            {inscriptionsLoading ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : availableInscriptions.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">
                {eventInscriptions.length === 0
                  ? t('results:noInscriptionsForEvent')
                  : t('results:allAthletesAdded')}
              </p>
            ) : (
              availableInscriptions.map(inscription => (
                <Button
                  key={inscription.id}
                  variant="outline"
                  className="h-auto w-full justify-between p-3"
                  disabled={createResult.isPending}
                  onClick={() => handleAddAthlete(inscription)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {inscription.athlete.firstName} {inscription.athlete.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {inscription.athlete.license}
                    </span>
                  </div>
                  {createResult.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface AddAthleteButtonProps {
  event: CompetitionEvent;
}

export function AddAthleteButton({ event }: AddAthleteButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
        <UserPlus className="h-4 w-4" />
        {t('results:addAthlete')}
      </Button>
      <AddAthleteDialog open={dialogOpen} onOpenChange={setDialogOpen} event={event} />
    </>
  );
}

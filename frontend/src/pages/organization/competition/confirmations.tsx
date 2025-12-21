import { useOrganizationCompetition } from '@/features/competitions';
import {
  AthletesView,
  EventsView,
  useConfirmationView,
  useUpdatePresenceStatus,
  ViewToggle,
} from '@/features/confirmations';
import { useOrganizationInscriptions } from '@/features/inscriptions';
import { useCompetitionEid } from '@/hooks';
import type { PresenceStatus } from '@repo/core/schemas';
import { Alert, AlertDescription } from '@repo/ui';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const CompetitionConfirmations = () => {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const competition = useOrganizationCompetition(competitionEid);
  const inscriptions = useOrganizationInscriptions(competitionEid);
  const { currentView, setView } = useConfirmationView();
  const updatePresenceStatus = useUpdatePresenceStatus(competitionEid);

  const handleSavePresence = (inscriptionIds: number[], presenceStatus: PresenceStatus) => {
    updatePresenceStatus.mutate(
      { inscriptionIds, presenceStatus },
      {
        onSuccess: () => {
          toast.success(t('confirmations:successUpdate'));
        },
        onError: () => {
          toast.error(t('confirmations:errorUpdate'));
        },
      },
    );
  };

  if (!competition.data?.hasConfirmation) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('confirmations:title')}</h1>
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>{t('confirmations:confirmationNotEnabled')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('confirmations:title')}</h1>
          <p className="text-muted-foreground">{t('confirmations:description')}</p>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setView} />
      </div>

      {currentView === 'athletes' ? (
        <AthletesView
          inscriptions={inscriptions.data}
          onSavePresence={handleSavePresence}
          isSaving={updatePresenceStatus.isPending}
        />
      ) : (
        <EventsView inscriptions={inscriptions.data} />
      )}
    </div>
  );
};

import {
  AthleteCard,
  AthleteSearch,
  usePrefetchAthleteBestPerformances,
} from '@/features/athletes';
import { useRequiredCompetition } from '@/features/competitions';
import { useUserInscriptions } from '@/features/inscriptions/hooks/use-inscriptions';
import { useCompetitionEid } from '@/hooks';
import { InscriptionStatus$, type Athlete } from '@repo/core/schemas';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { AlertTriangle, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAthleteBlockStatus } from '../../../hooks/use-athlete-registration-status';
import { useInscriptionFormStore } from '../../../store/inscription-form-store';

export function AthleteSelectionStep() {
  const { currentAthlete, setCurrentAthlete, setCurrentEventIds, setCurrentRecord } =
    useInscriptionFormStore();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const userInscriptions = useUserInscriptions();
  const { prefetch } = usePrefetchAthleteBestPerformances();

  const handleAthleteChange = (athlete: Athlete | undefined) => {
    setCurrentAthlete(athlete);

    // Prefetch athlete performances when an athlete is selected
    if (athlete?.license) {
      const recordsFromDate = competition.recordsFromDate
        ? new Date(competition.recordsFromDate).toISOString().split('T')[0]
        : undefined;
      prefetch(athlete.license, recordsFromDate);
    }

    const relatedInscriptions =
      userInscriptions.data?.filter(
        insc =>
          insc.athlete.id === athlete?.id &&
          insc.competitionId === competition.id &&
          insc.status !== InscriptionStatus$.enum.CANCELLED,
      ) || [];

    if (relatedInscriptions.length) {
      // Filter out sub-event inscriptions (only keep parent event IDs)
      const parentEventIds = relatedInscriptions
        .filter(insc => !insc.competitionEvent.parentId)
        .map(insc => insc.competitionEventId);
      setCurrentEventIds(parentEventIds);

      // Set records for all inscriptions (both parent and sub-events)
      relatedInscriptions.forEach(insc => {
        setCurrentRecord(insc.competitionEventId, insc.record || null);
      });
    }
  };

  if (currentAthlete) {
    return <AthleteDisplay />;
  }

  return (
    <AthleteSearch
      value={currentAthlete}
      onChange={handleAthleteChange}
      referenceDate={competition.startDate}
    />
  );
}

function AthleteDisplay() {
  const { t } = useTranslation();
  const { currentAthlete, setCurrentAthlete } = useInscriptionFormStore();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const { isBlocked, reason } = useAthleteBlockStatus(currentAthlete);

  if (!currentAthlete) return null;

  return (
    <div className={'w-full'}>
      <Card>
        <CardHeader>
          <CardTitle>{t('inscriptions:athleteSelected')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AthleteCard
            athlete={currentAthlete}
            referenceDate={competition.startDate}
            isClickable={false}
          />
          {isBlocked && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{reason}</AlertTitle>
              <AlertDescription>{t('messages:contactAdminIfNeeded')}</AlertDescription>
            </Alert>
          )}
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentAthlete(undefined)}
              className="gap-2"
            >
              <Edit2 className="h-3 w-3" />
              {t('inscriptions:changeAthlete')}
            </Button>
          </CardAction>
        </CardContent>
      </Card>
    </div>
  );
}

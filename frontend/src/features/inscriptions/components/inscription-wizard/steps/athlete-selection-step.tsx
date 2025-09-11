import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AthleteCard, AthleteSearch } from '@/features/athletes';
import { useRequiredCompetition } from '@/features/competitions';
import { useUserInscriptions } from '@/features/inscriptions/hooks/use-inscriptions';
import { useCompetitionEid } from '@/hooks';
import { InscriptionStatus$, type Athlete } from '@repo/core/schemas';
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

  const handleAthleteChange = (athlete: Athlete | undefined) => {
    setCurrentAthlete(athlete);

    const relatedInscriptions =
      userInscriptions.data?.filter(
        insc =>
          insc.athlete.id === athlete?.id &&
          insc.competitionId === competition.id &&
          insc.status !== InscriptionStatus$.enum.CANCELLED,
      ) || [];

    if (relatedInscriptions.length) {
      setCurrentEventIds(relatedInscriptions.map(insc => insc.competitionEventId));
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
  const { t } = useTranslation('inscriptions');
  const { currentAthlete, setCurrentAthlete } = useInscriptionFormStore();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const { isBlocked, reason } = useAthleteBlockStatus(currentAthlete);

  if (!currentAthlete) return null;

  return (
    <div className={'w-full'}>
      <Card>
        <CardHeader>
          <CardTitle>{t('athleteSelected')}</CardTitle>
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
              <AlertDescription>{t('contactAdminIfNeeded')}</AlertDescription>
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
              {t('changeAthlete')}
            </Button>
          </CardAction>
        </CardContent>
      </Card>
    </div>
  );
}

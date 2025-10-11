import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequiredCompetition } from '@/features/competitions';
import { useCompetitionInscriptions } from '@/features/inscriptions';
import { useCompetitionEid } from '@/hooks';
import { formatTime } from '@/lib/formatters';
import type { CompetitionEvent, InscriptionPublic } from '@repo/core/schemas';
import {
  formatPerformance,
  getAthleteCategory,
  getSeasonBib,
  getSeasonClub,
} from '@repo/core/utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export function CompetitionEventDetailPage() {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const { eventEid } = useParams<{ eventEid: string }>();

  const competition = useRequiredCompetition(competitionEid);
  const inscriptionsQuery = useCompetitionInscriptions(competitionEid);

  // Find the competition event
  const competitionEvent = useMemo(() => {
    return competition.events.find(e => e.eid === eventEid);
  }, [competition.events, eventEid]);

  if (!competitionEvent) {
    throw new Error('Event not found');
  }

  // Filter inscriptions for this specific competition event
  const eventInscriptions = useMemo(() => {
    if (!inscriptionsQuery.data) return [];

    return inscriptionsQuery.data.filter(
      (inscription: InscriptionPublic) =>
        inscription.competitionEvent.eid === eventEid && inscription.status !== 'CANCELLED',
    );
  }, [inscriptionsQuery.data, eventEid]);

  const participantCount = eventInscriptions.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Event Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground">
            <span className="text-xl font-bold">{formatTime(competitionEvent.eventStartTime)}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{competitionEvent.name}</h1>
            <p className="text-muted-foreground">
              {participantCount} {participantCount === 1 ? t('participants.title') : t('participants.title.plural')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrations">
            {t('registrations.text').toUpperCase()}
          </TabsTrigger>
          <TabsTrigger value="results">{t('results.text').toUpperCase()}</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="mt-6">
          <ParticipantsTable inscriptions={eventInscriptions} competitionEvent={competitionEvent} referenceDate={competition.startDate} />
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            {t('noResultsYet') || 'Results not available yet'}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ParticipantsTableProps {
  inscriptions: InscriptionPublic[];
  competitionEvent: CompetitionEvent;
  referenceDate: Date;
}

function ParticipantsTable({ inscriptions, competitionEvent, referenceDate }: ParticipantsTableProps) {
  const { t } = useTranslation();

  if (inscriptions.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{t('noParticipants')}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('participants.title')}</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('bib.title')}</TableHead>
              <TableHead>{t('athlete.title')}</TableHead>
              <TableHead>{t('category.title')}</TableHead>
              <TableHead>{t('club.title')}</TableHead>
              <TableHead>{t('personalBest.title')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscriptions.map(inscription => {
              const bib = getSeasonBib(inscription.athlete, referenceDate);
              const club = getSeasonClub(inscription.athlete);
              const clubName = typeof club === 'string' ? club : club?.abbr || '-';
              const category = getAthleteCategory(inscription.athlete, referenceDate);
              const performanceValue = inscription.record?.performanceValue;

              return (
                <TableRow key={`${inscription.athlete.id}-${competitionEvent.id}`}>
                  <TableCell className="font-medium">{bib || '-'}</TableCell>
                  <TableCell>
                    {inscription.athlete.firstName} {inscription.athlete.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.abbr}</Badge>
                  </TableCell>
                  <TableCell>{clubName}</TableCell>
                  <TableCell>
                    {performanceValue
                      ? formatPerformance(performanceValue, competitionEvent.event.type)
                      : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

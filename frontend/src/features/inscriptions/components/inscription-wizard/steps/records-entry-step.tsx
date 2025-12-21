import { useAthleteBestPerformances } from '@/features/athletes';
import { useRequiredCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import { formatDate } from '@/lib/formatters';
import { Alert, AlertDescription, Badge, Skeleton } from '@repo/ui';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInscriptionFormStore } from '../../../store/inscription-form-store';
import { EventRecordCard, findMatchingPerformance } from './records';

export function RecordsEntryStep() {
  const { t } = useTranslation();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const { currentAthlete, currentEventIds, currentRecords, setCurrentRecord } =
    useInscriptionFormStore();
  const hasInitializedRef = useRef(false);

  if (!currentAthlete) {
    throw new Error('No athlete selected in RecordsEntryStep');
  }

  const recordsFromDate = competition.recordsFromDate
    ? new Date(competition.recordsFromDate).toISOString().split('T')[0]
    : undefined;

  const {
    data: performancesData,
    isLoading,
    isError,
  } = useAthleteBestPerformances(currentAthlete?.license, { fromDate: recordsFromDate });

  // Get selected competition events
  const selectedEvents = competition.events.filter(event => currentEventIds.includes(event.id));

  // Auto-populate records from Beathletics when data is loaded (only once)
  useEffect(() => {
    if (performancesData && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const performances = performancesData.bestPerformances;

      for (const event of selectedEvents) {
        // Only set if no record exists yet for this event
        if (!currentRecords[event.id]) {
          const matchingPerf = findMatchingPerformance(event, performances);
          if (matchingPerf) {
            setCurrentRecord(event.id, {
              performanceValue: matchingPerf.value,
              achievedDate: new Date(matchingPerf.date),
              location: matchingPerf.location,
            });
          }
        }
      }
    }
  }, [performancesData, selectedEvents, currentRecords, setCurrentRecord]);

  if (!currentAthlete) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t('inscriptions:enterPersonalRecords')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('inscriptions:optionalPersonalBestTimes')}
        </p>
      </div>

      {/* From date info */}
      {recordsFromDate && (
        <div className="text-center">
          <Badge variant="outline">
            {t('inscriptions:recordsSince', { date: formatDate(recordsFromDate) })}
          </Badge>
        </div>
      )}

      {/* Source attribution */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>{t('inscriptions:performancesSource')}</span>
        <a
          href="https://www.beathletics.be/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          beathletics.be
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="max-w-md mx-auto space-y-3">
          {selectedEvents.map(event => (
            <Skeleton key={event.id} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t('inscriptions:performancesFetchError')}</AlertDescription>
        </Alert>
      )}

      {/* Performance entry cards */}
      {!isLoading && (
        <div className="max-w-md mx-auto space-y-4">
          {selectedEvents.map(event => (
            <EventRecordCard
              key={event.id}
              event={event}
              performances={performancesData?.bestPerformances ?? []}
              record={currentRecords[event.id]}
              onRecordChange={record => setCurrentRecord(event.id, record)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

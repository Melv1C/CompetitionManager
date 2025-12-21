import { formatDate } from '@/lib/formatters';
import type { CompetitionEvent, Performance, UpsertRecord } from '@repo/core/schemas';
import { formatPerformance } from '@repo/core/utils';
import { Badge, Button } from '@repo/ui';
import { Pencil, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { findMatchingPerformance } from './performance-utils';
import { RecordEditModal } from './record-edit-modal';

interface EventRecordCardProps {
  event: CompetitionEvent;
  performances: Performance[];
  record: UpsertRecord | undefined;
  onRecordChange: (record: UpsertRecord | null) => void;
}

export function EventRecordCard({
  event,
  performances,
  record,
  onRecordChange,
}: EventRecordCardProps) {
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Find matching performance for this event (for reference)
  const matchingPerformance = findMatchingPerformance(event, performances);

  const hasRecord = record !== undefined;
  const hasMatchingPerformance = matchingPerformance !== null;
  const isFromBeathletics =
    record &&
    matchingPerformance &&
    record.performanceValue === matchingPerformance.value &&
    record.location === matchingPerformance.location;

  const handleClearRecord = () => {
    onRecordChange(null);
  };

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3">
        {/* Event header */}
        <div className="flex items-center justify-between">
          <span className="font-medium">{event.name}</span>
          {isFromBeathletics && (
            <Badge variant="secondary" className="text-xs">
              {t('inscriptions:fromBeathletics')}
            </Badge>
          )}
        </div>

        {/* Record display */}
        {hasRecord ? (
          <div className="flex items-center justify-between bg-muted/50 rounded-md p-3">
            <div className="space-y-1">
              <div className="font-mono text-lg">
                {formatPerformance(record.performanceValue, event.event.type)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(record.achievedDate)}
                {record.location && ` • ${record.location}`}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleClearRecord}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {hasMatchingPerformance
                ? t('inscriptions:beathleticsAvailable')
                : t('inscriptions:noRecordFound')}
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              {hasMatchingPerformance
                ? t('inscriptions:useBeathleticsRecord')
                : t('inscriptions:addRecord')}
            </Button>
          </div>
        )}

        {/* Beathletics reference (if available and different from current) */}
        {hasMatchingPerformance && hasRecord && !isFromBeathletics && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{t('inscriptions:beathleticsRecord')}:</span>{' '}
            {formatPerformance(matchingPerformance.value, event.event.type)}
            {matchingPerformance.wind !== null && (
              <span className="ml-1">
                ({matchingPerformance.wind > 0 ? '+' : ''}
                {matchingPerformance.wind.toFixed(1)} m/s)
              </span>
            )}{' '}
            • {formatDate(matchingPerformance.date)} • {matchingPerformance.location}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <RecordEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        event={event}
        record={record}
        matchingPerformance={matchingPerformance}
        onSave={onRecordChange}
      />
    </>
  );
}

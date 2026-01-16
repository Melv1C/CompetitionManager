import type { Inscription } from '@repo/core/schemas';
import { Alert, AlertDescription } from '@repo/ui';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'node_modules/react-i18next';
import { useEventInscriptionsMap } from '../hooks/use-event-filtering';
import { EventCard } from './event-card';

interface EventsViewProps {
  inscriptions: Inscription[] | undefined;
}

export const EventsView = ({ inscriptions }: EventsViewProps) => {
  const { t } = useTranslation();
  const eventsWithInscriptions = useEventInscriptionsMap(inscriptions);

  if (eventsWithInscriptions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="size-4" />
        <AlertDescription>{t('confirmations:noInscriptions')}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {eventsWithInscriptions.map(eventData => (
        <EventCard key={eventData.event.id} eventData={eventData} />
      ))}
    </div>
  );
};

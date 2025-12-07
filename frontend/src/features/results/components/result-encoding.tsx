import { useRequiredOrganizationCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import type { CompetitionEvent, EventType } from '@repo/core/schemas';
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { X } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { AddEventButton } from './add-event-dialog';
import { TimeResultSheet } from './time-result-sheet';

const EVENTS_PARAM = 'events';
const ACTIVE_PARAM = 'active';

function getResultSheetComponent(eventType: EventType, event: CompetitionEvent) {
  switch (eventType) {
    case 'time':
      return <TimeResultSheet event={event} />;
    case 'distance':
    case 'height':
    case 'points':
      // TODO: Implement other result sheet types
      return (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Result sheet for {eventType} events coming soon...
        </div>
      );
    default:
      return null;
  }
}

export function ResultEncoding() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const competitionEid = useCompetitionEid();
  const competition = useRequiredOrganizationCompetition(competitionEid);
  const allEvents = competition.events;

  // Parse event IDs from URL
  const eventIdsFromUrl = useMemo(() => {
    const param = searchParams.get(EVENTS_PARAM);
    if (!param) return [];
    return param
      .split(',')
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
  }, [searchParams]);

  const activeTabFromUrl = searchParams.get(ACTIVE_PARAM);

  // Resolve event IDs to full CompetitionEvent objects
  const openEvents = useMemo(() => {
    return eventIdsFromUrl
      .map(id => allEvents.find(e => e.id === id))
      .filter((e): e is CompetitionEvent => e !== undefined);
  }, [eventIdsFromUrl, allEvents]);

  // Determine active tab
  const activeTab = useMemo(() => {
    if (activeTabFromUrl && openEvents.some(e => e.id.toString() === activeTabFromUrl)) {
      return activeTabFromUrl;
    }
    return openEvents.length > 0 ? openEvents[0].id.toString() : undefined;
  }, [activeTabFromUrl, openEvents]);

  // Update URL with event IDs
  const updateUrl = useCallback(
    (eventIds: number[], activeEventId?: string) => {
      setSearchParams(
        prev => {
          if (eventIds.length > 0) {
            prev.set(EVENTS_PARAM, eventIds.join(','));
            if (activeEventId) {
              prev.set(ACTIVE_PARAM, activeEventId);
            }
          } else {
            prev.delete(EVENTS_PARAM);
            prev.delete(ACTIVE_PARAM);
          }
          return prev;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleAddEvent = useCallback(
    (event: CompetitionEvent) => {
      const newEventIds = [...eventIdsFromUrl, event.id];
      updateUrl(newEventIds, event.id.toString());
    },
    [eventIdsFromUrl, updateUrl],
  );

  const handleRemoveEvent = useCallback(
    (eventId: number) => {
      const newEventIds = eventIdsFromUrl.filter(id => id !== eventId);
      // If we're closing the active tab, switch to the last remaining tab
      let newActiveTab: string | undefined;
      if (activeTab === eventId.toString() && newEventIds.length > 0) {
        newActiveTab = newEventIds[newEventIds.length - 1].toString();
      } else if (newEventIds.length > 0) {
        newActiveTab = activeTab;
      }
      updateUrl(newEventIds, newActiveTab);
    },
    [eventIdsFromUrl, activeTab, updateUrl],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      updateUrl(eventIdsFromUrl, value);
    },
    [eventIdsFromUrl, updateUrl],
  );

  const excludedEventIds = openEvents.map(e => e.id);

  if (openEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12">
        <p className="text-center text-muted-foreground">{t('results:noOpenSheets')}</p>
        <AddEventButton onSelectEvent={handleAddEvent} excludedEventIds={excludedEventIds} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center gap-2">
          <TabsList className="h-auto flex-wrap">
            {openEvents.map(event => (
              <TabsTrigger
                key={event.id}
                value={event.id.toString()}
                className="group relative gap-1 pr-7"
              >
                <span className="max-w-32 truncate">{event.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 h-5 w-5"
                  onClick={e => {
                    e.stopPropagation();
                    handleRemoveEvent(event.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </TabsTrigger>
            ))}
          </TabsList>
          <AddEventButton onSelectEvent={handleAddEvent} excludedEventIds={excludedEventIds} />
        </div>

        {openEvents.map(event => (
          <TabsContent key={event.id} value={event.id.toString()} className="mt-4">
            {getResultSheetComponent(event.event.type, event)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

import type { CompetitionEvent, Inscription } from '@repo/core/schemas';
import { useMemo } from 'react';
import type { PresenceStatusCounts } from '../types';

export interface EventWithInscriptions {
  event: CompetitionEvent;
  inscriptions: Inscription[];
  counts: PresenceStatusCounts;
}

export const useEventInscriptionsMap = (
  inscriptions: Inscription[] | undefined,
): EventWithInscriptions[] => {
  return useMemo(() => {
    if (!inscriptions) return [];

    const map = new Map<number, { event: CompetitionEvent; inscriptions: Inscription[] }>();

    inscriptions.forEach(inscription => {
      const eventId = inscription.competitionEvent.id;
      const existing = map.get(eventId);
      if (existing) {
        existing.inscriptions.push(inscription);
      } else {
        map.set(eventId, {
          event: inscription.competitionEvent,
          inscriptions: [inscription],
        });
      }
    });

    // Convert to array and add counts
    const result: EventWithInscriptions[] = Array.from(map.values()).map(
      ({ event, inscriptions }) => ({
        event,
        inscriptions,
        counts: {
          presentCount: inscriptions.filter(i => i.presenceStatus === 'PRESENT').length,
          absentCount: inscriptions.filter(i => i.presenceStatus === 'ABSENT').length,
          unknownCount: inscriptions.filter(i => i.presenceStatus === 'UNKNOWN').length,
        },
      }),
    );

    // Sort by event start time
    result.sort((a, b) => {
      const timeA = new Date(a.event.eventStartTime).getTime();
      const timeB = new Date(b.event.eventStartTime).getTime();
      return timeA - timeB;
    });

    return result;
  }, [inscriptions]);
};

import { useRequiredCompetition } from '@/features/competitions/hooks/use-competitions';
import { useRequiredCompetitionInscriptions } from '@/features/inscriptions/hooks/use-inscriptions';
import { useCompetitionEid } from '@/hooks/use-competition-eid';
import { formatTime } from '@/lib/formatters';
import type { CompetitionEvent, Id } from '@repo/core/schemas';
import { getAthleteCategory, getSeasonClub } from '@repo/core/utils';
import { Badge, Checkbox, Label } from '@repo/ui';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInscriptionFormStore } from '../../../store/inscription-form-store';

export function EventSelectionStep() {
  const { t } = useTranslation();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);

  const { currentAthlete, currentEventIds, setCurrentEventIds } = useInscriptionFormStore();

  const currentAthleteCategory = currentAthlete
    ? getAthleteCategory(currentAthlete, competition.startDate)
    : null;

  // Get eligible parent events (only parent events that match the category)
  const eligibleParentEvents = currentAthlete
    ? competition.events.filter(
        event =>
          !event.parentId &&
          event.categories.some(category => category.abbr === currentAthleteCategory?.abbr),
      )
    : [];

  // Build sub-events map from ALL competition events (sub-events may not have categories)
  const subEventsMap = new Map<Id, CompetitionEvent[]>();
  for (const event of competition.events) {
    if (event.parentId) {
      const existing = subEventsMap.get(event.parentId) ?? [];
      subEventsMap.set(event.parentId, [...existing, event]);
    }
  }

  // Sort sub-events by start time
  for (const [parentId, subEvents] of subEventsMap) {
    subEventsMap.set(
      parentId,
      subEvents.sort(
        (a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime(),
      ),
    );
  }

  // Sort parent events by start time
  const sortedParentEvents = eligibleParentEvents.sort(
    (a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime(),
  );

  const handleEventToggle = (eventId: Id, checked: boolean) => {
    const updatedIds = checked
      ? [...currentEventIds, eventId]
      : currentEventIds.filter(id => id !== eventId);
    setCurrentEventIds(updatedIds);
  };

  return (
    <div className="space-y-6">
      {/* Events List */}
      <div className="max-w-2xl mx-auto">
        {sortedParentEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('inscriptions:noEventsAvailable')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Events */}
            <div className="grid gap-2">
              {sortedParentEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  subEvents={subEventsMap.get(event.id)}
                  checked={currentEventIds.includes(event.id)}
                  onToggle={handleEventToggle}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function useParticipantCount(event: CompetitionEvent): number {
  const eid = useCompetitionEid();
  const inscription = useRequiredCompetitionInscriptions(eid);
  const { currentAthlete, currentEventIds, registrations } = useInscriptionFormStore();

  // Count inscriptions for this event
  const inscriptionCount =
    inscription.filter(
      insc =>
        insc.competitionEvent.id === event.id &&
        insc.athlete.id !== currentAthlete?.id &&
        !registrations.map(reg => reg.athlete.id).includes(insc.athlete.id),
    ).length ?? 0;

  // Add if event is currently selected
  const isEventSelected = currentEventIds.includes(event.id) ? 1 : 0;

  // Count form registrations for this event
  const registrationCount = registrations.reduce(
    (acc, reg) =>
      acc + reg.inscriptions.filter(insc => insc.competitionEventId === event.id).length,
    0,
  );
  // Calculate total count
  return inscriptionCount + isEventSelected + registrationCount;
}

function useIsEventDisabled(event: CompetitionEvent, participantCount: number): boolean {
  const { currentEventIds } = useInscriptionFormStore();

  if (!event.maxParticipants) return false;
  if (currentEventIds.includes(event.id)) return false;

  return participantCount >= event.maxParticipants;
}

interface EventCardProps {
  event: CompetitionEvent;
  subEvents?: CompetitionEvent[];
  checked: boolean;
  onToggle: (eventId: Id, checked: boolean) => void;
}

function EventCard({ event, subEvents, checked, onToggle }: EventCardProps) {
  const { t } = useTranslation();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const { currentAthlete } = useInscriptionFormStore();

  if (!currentAthlete) throw new Error('No athlete selected');

  const participantCount = useParticipantCount(event);
  const isDisabled = useIsEventDisabled(event, participantCount);

  // Check if athlete is from a free club
  const athleteClub = getSeasonClub(currentAthlete, competition.startDate);
  const isFree = competition.freeClubs.map(c => c.id).includes(athleteClub?.id || -1);

  const hasSubEvents = subEvents && subEvents.length > 0;

  return (
    <div className="border rounded-lg hover:bg-muted/50 transition-colors">
      <Label
        className={`cursor-pointer flex items-center space-x-3 p-3 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={checked => onToggle(event.id, checked as boolean)}
          disabled={isDisabled}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-muted-foreground">
                {formatTime(event.eventStartTime)}
              </div>
              <p className="font-medium text-sm">{event.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {!isFree && <Badge variant="outline">€{event.price.toFixed(2)}</Badge>}
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {event.maxParticipants
                  ? `${participantCount} / ${event.maxParticipants}`
                  : participantCount}
              </Badge>
            </div>
          </div>
        </div>
      </Label>

      {/* Sub-events list */}
      {hasSubEvents && (
        <div className="border-t bg-muted/30 px-3 py-2 space-y-1">
          <div className="text-xs text-muted-foreground font-medium mb-1 pl-7">
            {t('inscriptions:subEvents')}:
          </div>
          {subEvents.map(subEvent => (
            <div
              key={subEvent.id}
              className="flex items-center gap-3 pl-7 text-sm text-muted-foreground"
            >
              <span className="text-xs font-mono">{formatTime(subEvent.eventStartTime)}</span>
              <span>{subEvent.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

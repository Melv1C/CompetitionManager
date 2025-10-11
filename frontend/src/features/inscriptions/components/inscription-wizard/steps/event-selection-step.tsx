import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useRequiredCompetition } from '@/features/competitions/hooks/use-competitions';
import { useRequiredCompetitionInscriptions } from '@/features/inscriptions/hooks/use-inscriptions';
import { Users } from 'lucide-react';
import { useCompetitionEid } from '@/hooks/use-competition-eid';
import { formatTime } from '@/lib/formatters';
import type { CompetitionEvent, Id } from '@repo/core/schemas';
import { getAthleteCategory, getSeasonClub } from '@repo/core/utils';
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

  const eligibleEvents = currentAthlete
    ? competition.events
        .filter(event =>
          event.categories.some(category => category.abbr === currentAthleteCategory?.abbr),
        )
        .sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime())
    : [];

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
        {eligibleEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('inscriptions:noEventsAvailable')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Events */}
            <div className="grid gap-2">
              {eligibleEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
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
  checked: boolean;
  onToggle: (eventId: Id, checked: boolean) => void;
}

function EventCard({ event, checked, onToggle }: EventCardProps) {
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const { currentAthlete } = useInscriptionFormStore();

  const participantCount = useParticipantCount(event);
  const isDisabled = useIsEventDisabled(event, participantCount);

  // Check if athlete is from a free club
  const athleteClub = getSeasonClub(currentAthlete, competition.startDate);
  const isFree = competition.freeClubs.map(c => c.id).includes(athleteClub?.id || -1);

  return (
    <Label
      key={event.id}
      className={`cursor-pointer flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
  );
}

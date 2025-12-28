import { formatTime } from '@/lib/formatters';
import type { Competition, CompetitionEvent, Id } from '@repo/core/schemas';
import { formatPerformance, getSeasonClub } from '@repo/core/utils';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@repo/ui';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AthleteRegistration } from '../../store/inscription-form-store';

/** Get sub-events for a given parent event */
function getSubEvents(events: CompetitionEvent[], parentId: Id): CompetitionEvent[] {
  return events
    .filter(e => e.parentId === parentId)
    .sort((a, b) => new Date(a.eventStartTime).getTime() - new Date(b.eventStartTime).getTime());
}

interface AthleteTicketProps {
  registration: AthleteRegistration;
  competition: Competition;
  onRemove: (athleteId: Id) => void;
  onModify: (athleteId: Id) => void;
  getAlreadyPaid: (athleteId: Id) => number;
}

export function AthleteTicket({
  registration,
  competition,
  onRemove,
  onModify,
  getAlreadyPaid,
}: AthleteTicketProps) {
  const { t } = useTranslation();

  const athleteClub = getSeasonClub(registration.athlete, competition.startDate);
  const isFree = competition.freeClubs.map(c => c.id).includes(athleteClub?.id || -1);

  // Calculate subtotal for an athlete (sum of all event prices)
  const calculateSubtotal = () => {
    if (isFree) {
      return 0; // Free inscription
    }

    return registration.inscriptions.reduce((total, inscription) => {
      const event = competition.events.find(e => e.id === inscription.competitionEventId);
      return total + (event?.price || 0);
    }, 0);
  };

  // Calculate the amount to pay for an athlete (subtotal - already paid)
  const calculateAmountToPay = () => {
    const subtotal = calculateSubtotal();
    const alreadyPaid = getAlreadyPaid(registration.athlete.id);
    return Math.max(0, subtotal - alreadyPaid); // Ensure non-negative
  };

  const subtotal = calculateSubtotal();
  const alreadyPaid = getAlreadyPaid(registration.athlete.id);
  const amountToPay = calculateAmountToPay();

  return (
    <Card className="border-dashed border-2 p-2">
      {/* Athlete Header */}
      <CardHeader className="pb-1 px-3 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {registration.athlete.firstName} {registration.athlete.lastName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onModify(registration.athlete.id)}
              className="h-8 w-8 p-0"
              title={t('inscriptions:modifyRegistration')}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(registration.athlete.id)}
              className="h-8 w-8 p-0"
              title={t('inscriptions:removeRegistration')}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-1">
        {/* Events - only show parent events, with sub-events nested */}
        <div className="space-y-1">
          {registration.inscriptions
            .filter(inscription => {
              // Only show parent events (events without parentId)
              const event = competition.events.find(e => e.id === inscription.competitionEventId);
              return event && !event.parentId;
            })
            .map((inscription, idx) => {
              const event = competition.events.find(e => e.id === inscription.competitionEventId);
              if (!event) return null;

              const subEvents = getSubEvents(competition.events, event.id);
              const hasSubEvents = subEvents.length > 0;

              // Find records for sub-events from the registration's records
              const subEventRecords = hasSubEvents
                ? subEvents.map(subEvent => ({
                    subEvent,
                    record: registration.inscriptions.find(
                      insc => insc.competitionEventId === subEvent.id,
                    )?.record,
                  }))
                : [];

              return (
                <div key={idx} className="py-1">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                        {formatTime(event.eventStartTime)}
                      </span>
                      <span className="font-medium text-sm">{event.name}</span>
                      {!hasSubEvents && inscription.record?.performanceValue && (
                        <span className="text-xs text-muted-foreground">
                          {formatPerformance(
                            inscription.record?.performanceValue,
                            event.event.type,
                          )}
                        </span>
                      )}
                    </div>
                    {!isFree && (
                      <div className="text-sm font-medium">{`€${event.price.toFixed(2)}`}</div>
                    )}
                  </div>

                  {/* Sub-events for multi-events */}
                  {hasSubEvents && (
                    <div className="mt-2 ml-4 pl-3 border-l-2 border-muted space-y-1">
                      {subEventRecords.map(({ subEvent, record }) => (
                        <div
                          key={subEvent.id}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-xs font-mono">
                            {formatTime(subEvent.eventStartTime)}
                          </span>
                          <span>{subEvent.name}</span>
                          {record?.performanceValue && (
                            <span className="text-xs">
                              {formatPerformance(record.performanceValue, subEvent.event.type)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {!isFree && (
          <>
            <Separator className="my-2" />

            {/* Athlete Subtotal, Already Paid, and Amount to Pay */}
            <div className="space-y-1">
              {alreadyPaid > 0 ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span>{t('inscriptions:subtotal')}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('inscriptions:alreadyPaid')}</span>
                    <span>-€{alreadyPaid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>{t('inscriptions:amountToPay')}</span>
                    <span className="text-primary">€{amountToPay.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-medium">
                  <span>{t('inscriptions:amountToPay')}</span>
                  <span className="text-primary">€{amountToPay.toFixed(2)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks/use-competition-eid';
import { useInscriptionFormStore } from '../../../../store/inscription-form-store';

export function SummaryStep() {
  const { t } = useTranslation();
  const eid = useCompetitionEid();
  const competition = useCompetition(eid);

  const { currentAthlete, currentEventIds, registrations, removeRegistration } =
    useInscriptionFormStore();

  const selectedEvents = competition.data.events.filter((e) =>
    currentEventIds.includes(e.id)
  );

  const calculateCurrentTotal = () => {
    return selectedEvents.reduce((total, event) => total + event.price, 0);
  };

  const calculateRegistrationTotal = (
    registration: (typeof registrations)[0]
  ) => {
    return registration.inscriptions.reduce((total, inscription) => {
      const event = competition.data.events.find(
        (e) => e.id === inscription.competitionEventId
      );
      return total + (event?.price || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t('registrationSummary')}</h2>
        <p className="text-muted-foreground text-sm">{t('reviewAndConfirm')}</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Current Registration */}
        {currentAthlete && selectedEvents.length > 0 && (
          <div className="border rounded-lg p-4 bg-blue-50/50 border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">
                {t('currentRegistration')}
              </h3>
              <Badge variant="secondary">{t('pending')}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {currentAthlete.firstName} {currentAthlete.lastName}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-muted-foreground">{event.name}</span>
                    <span>€{event.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="flex justify-between items-center font-medium">
                <span>{t('subtotal')}</span>
                <span>€{calculateCurrentTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Completed Registrations */}
        {registrations.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center justify-between">
              <span>{t('completedRegistrations')}</span>
              <Badge variant="outline">{registrations.length}</Badge>
            </h3>

            {registrations.map((registration, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-sm">
                      {registration.athlete.firstName}{' '}
                      {registration.athlete.lastName}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {registration.inscriptions.length} {t('events')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRegistration(registration.athlete.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-1 text-sm">
                  {registration.inscriptions.map((inscription, idx) => {
                    const event = competition.data.events.find(
                      (e) => e.id === inscription.competitionEventId
                    );
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <span className="text-muted-foreground">
                          {event?.name}
                        </span>
                        <span>€{event?.price.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-2" />
                <div className="flex justify-between items-center font-medium text-sm">
                  <span>{t('subtotal')}</span>
                  <span>
                    €{calculateRegistrationTotal(registration).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {registrations.length === 0 &&
          (!currentAthlete || selectedEvents.length === 0) && (
            <div className="text-center py-12 border rounded-lg border-dashed">
              <p className="text-muted-foreground">{t('noRegistrationsYet')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('completeTheFormToSeeRegistrations')}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

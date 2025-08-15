import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Plus, ShoppingCart, Trash2, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks/use-competition-eid';
import { formatTime } from '@/lib/formatters';
import { useInscriptionFormStore } from '@/store/inscription-form-store';
import { formatPerformance } from '@repo/core/utils';
import { useNavigate } from 'react-router-dom';
import { useCreateInscriptions } from '../hooks/use-inscriptions';

export function RegistrationBasket() {
  const { t } = useTranslation(['inscriptions']);
  const eid = useCompetitionEid();
  const navigate = useNavigate();
  const competition = useCompetition(eid);
  const createInscriptions = useCreateInscriptions(eid);

  const { registrations, removeRegistration, goToForm, hasRegistrations } =
    useInscriptionFormStore();

  const handleProceedToPayment = async () => {
    try {
      const allInscriptions = registrations.flatMap(reg => reg.inscriptions);

      if (allInscriptions.length > 0) {
        await createInscriptions.mutateAsync({ inscriptions: allInscriptions });
        navigate(`/competitions/${eid}/participants`);
      }
    } catch (error) {
      console.error('Failed to create inscriptions:', error);
    }
  };

  const calculateRegistrationTotal = (registration: (typeof registrations)[0]) => {
    return registration.inscriptions.reduce((total, inscription) => {
      const event = competition.data.events.find(e => e.id === inscription.competitionEventId);
      return total + (event?.price || 0);
    }, 0);
  };

  const subtotalPrice = registrations.reduce((total, registration) => {
    return total + calculateRegistrationTotal(registration);
  }, 0);

  const alreadyPaidTotal = registrations.reduce(total => {
    return total + 0; // TODO: Implement already paid calculation
  }, 0);

  const processingFee = 0.99;
  const totalPrice = subtotalPrice - alreadyPaidTotal + (subtotalPrice > 0 ? processingFee : 0);

  if (!hasRegistrations()) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Empty State */}
        <div className="text-center space-y-6 py-12">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('registrationBasket')}</h1>
            <p className="text-muted-foreground">{t('noRegistrationsInBasket')}</p>
          </div>
          <Button onClick={goToForm} size="lg">
            <UserPlus className="w-4 h-4 mr-2" />
            {t('registerFirstAthlete')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          <span>{t('registrationBasket')}</span>
        </h1>
        <p className="text-sm text-muted-foreground">{t('reviewRegistrationsAndProceed')}</p>
      </div>

      {/* Ticket-style Registration List */}
      <div className="space-y-3">
        {registrations.map((registration, index) => (
          <Card key={index} className="border-dashed border-2 p-2">
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
                    onClick={() => removeRegistration(registration.athlete.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-3 pb-3 pt-1">
              {/* Events */}
              <div className="space-y-1">
                {registration.inscriptions.map((inscription, idx) => {
                  const event = competition.data.events.find(
                    e => e.id === inscription.competitionEventId,
                  );
                  return (
                    <div key={idx} className="py-1">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                            {formatTime(event!.eventStartTime)}
                          </span>
                          <span className="font-medium text-sm">{event!.name}</span>
                          {inscription.record?.performanceValue && (
                            <span className="text-xs text-muted-foreground">
                              {formatPerformance(
                                inscription.record?.performanceValue,
                                event!.event.type,
                              )}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium">€{event?.price.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-2" />

              {/* Athlete Subtotal and Already Paid */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal')}</span>
                  <span>€{calculateRegistrationTotal(registration).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Final Summary */}
      <Card className="border-2">
        <CardHeader className="pb-1 px-3 pt-3">
          <CardTitle className="text-lg">{t('orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-1">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{t('subtotal')}</span>
              <span>€{subtotalPrice.toFixed(2)}</span>
            </div>
            {alreadyPaidTotal > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('alreadyPaid')}</span>
                <span>-€{alreadyPaidTotal.toFixed(2)}</span>
              </div>
            )}
            {subtotalPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('processingFee')}</span>
                <span>€{processingFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-bold text-lg">
            <span>{t('total')}</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button onClick={goToForm} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {t('addAnotherAthlete')}
        </Button>

        <Button
          onClick={handleProceedToPayment}
          className="w-full"
          size="lg"
          disabled={createInscriptions.isPending}
        >
          {totalPrice > 0 && <CreditCard className="w-4 h-4 mr-2" />}
          {createInscriptions.isPending
            ? t('processing')
            : totalPrice > 0
              ? t('proceedToPayment')
              : t('confirmRegistration')}
        </Button>
      </div>
    </div>
  );
}

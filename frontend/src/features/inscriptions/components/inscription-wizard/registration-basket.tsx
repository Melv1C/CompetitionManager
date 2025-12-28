import { useRequiredCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks/use-competition-eid';
import type { Id } from '@repo/core/schemas';
import { BASE_FEE, VARIABLE_FEE_RATE, getFees, getSeasonClub } from '@repo/core/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui';
import { CreditCard, HelpCircle, Plus, ShoppingCart, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAlreadyPaidAmounts, useCreateInscriptions } from '../../hooks/use-inscriptions';
import { useInscriptionFormStore } from '../../store/inscription-form-store';
import { AthleteTicket } from './athlete-ticket';

function RegistrationBasketSkeleton() {
  const { t } = useTranslation();
  const { registrations } = useInscriptionFormStore();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          <span>{t('inscriptions:registrationBasket')}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('inscriptions:reviewRegistrationsAndProceed')}
        </p>
      </div>

      {/* Skeleton for Registration List */}
      <div className="space-y-3">
        {registrations.map((_, index) => (
          <Card className="border-dashed border-2 p-2" key={index}>
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-1">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Separator className="my-3" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between font-bold">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skeleton for Final Summary */}
      <Card className="border-2">
        <CardHeader className="pb-1 px-3 pt-3">
          <CardTitle className="text-lg">{t('inscriptions:orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-1">
          <div className="space-y-2 mb-3">
            {registrations.map((_, index) => (
              <div key={index} className="flex justify-between text-sm">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>

          <Separator className="my-2" />

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between text-sm">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-bold text-lg">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardContent>
      </Card>

      {/* Skeleton for Actions */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export function RegistrationBasket() {
  const { t } = useTranslation();
  const eid = useCompetitionEid();
  const navigate = useNavigate();
  const competition = useRequiredCompetition(eid);
  const createInscriptions = useCreateInscriptions(eid);
  const {
    registrations,
    removeRegistration,
    modifyRegistration,
    goToForm,
    hasRegistrations,
    clearBasket,
  } = useInscriptionFormStore();

  // Wrap modifyRegistration to pass competition events
  const handleModifyRegistration = (athleteId: Id) => {
    modifyRegistration(athleteId, competition.events);
  };

  const alreadyPaidAmounts = useAlreadyPaidAmounts(
    competition.id,
    registrations.map(reg => reg.athlete.id),
  );
  if (alreadyPaidAmounts.isError) throw new Error('Error loading already paid amounts');

  const handleProceedToPayment = async () => {
    try {
      const allInscriptions = registrations.flatMap(reg => reg.inscriptions);

      if (allInscriptions.length > 0) {
        const result = await createInscriptions.mutateAsync({ inscriptions: allInscriptions });
        if (result.type === 'inscription') {
          clearBasket();
          navigate(`/competitions/${eid}/register/success`);
        } else if (result.type === 'payment') {
          window.location.href = result.url;
        }
      }
    } catch (error) {
      console.error('Failed to create inscriptions:', error);
    }
  };

  // Get already paid amount for an athlete (TODO: implement from backend)
  const getAthleteAlreadyPaid = (athleteId: Id) => {
    return alreadyPaidAmounts.data?.perAthlete[athleteId.toString()] ?? 0;
  };

  // Helper functions moved to AthleteTicket component, but we still need them here for calculations
  const calculateAthleteSubtotal = (registration: (typeof registrations)[0]) => {
    // Check if athlete is from a free club
    const athleteClub = getSeasonClub(registration.athlete, competition.startDate);
    const isFree = competition.freeClubs.map(c => c.id).includes(athleteClub?.id || -1);

    if (isFree) {
      return 0; // Free inscription
    }

    return registration.inscriptions.reduce((total, inscription) => {
      const event = competition.events.find(e => e.id === inscription.competitionEventId);
      return total + (event?.price || 0);
    }, 0);
  };

  const calculateAthleteAmountToPay = (registration: (typeof registrations)[0]) => {
    const subtotal = calculateAthleteSubtotal(registration);
    const alreadyPaid = getAthleteAlreadyPaid(registration.athlete.id);
    return Math.max(0, subtotal - alreadyPaid);
  };

  // Calculate total amount to pay (sum of all athletes' amounts to pay)
  const totalAmountToPay = registrations.reduce((total, registration) => {
    return total + calculateAthleteAmountToPay(registration);
  }, 0);

  const processingFee = getFees(totalAmountToPay);
  const finalTotal = totalAmountToPay + processingFee;

  if (alreadyPaidAmounts.isPending) {
    return <RegistrationBasketSkeleton />;
  }

  if (!hasRegistrations()) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Empty State */}
        <div className="text-center space-y-6 py-12">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('inscriptions:registrationBasket')}</h1>
            <p className="text-muted-foreground">{t('inscriptions:noRegistrationsInBasket')}</p>
          </div>
          <Button onClick={goToForm} size="lg">
            <UserPlus className="w-4 h-4 mr-2" />
            {t('inscriptions:registerFirstAthlete')}
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
          <span>{t('inscriptions:registrationBasket')}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('inscriptions:reviewRegistrationsAndProceed')}
        </p>
      </div>

      {/* Ticket-style Registration List */}
      <div className="space-y-3">
        {registrations.map((registration, index) => (
          <AthleteTicket
            key={index}
            registration={registration}
            competition={competition}
            onRemove={removeRegistration}
            onModify={handleModifyRegistration}
            getAlreadyPaid={getAthleteAlreadyPaid}
          />
        ))}
      </div>

      {/* Final Summary */}
      <Card className="border-2">
        <CardHeader className="pb-1 px-3 pt-3">
          <CardTitle className="text-lg">{t('inscriptions:orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-1">
          {totalAmountToPay > 0 ? (
            <>
              {/* Athletes breakdown */}
              <div className="space-y-2 mb-3">
                {registrations.map((registration, index) => {
                  const athleteAmountToPay = calculateAthleteAmountToPay(registration);
                  const eventCount = registration.inscriptions.length;
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {registration.athlete.firstName} {registration.athlete.lastName}{' '}
                        <span className="text-muted-foreground">
                          ({eventCount} {eventCount === 1 ? t('event.text') : t('events.text')})
                        </span>
                      </span>
                      <span>€{athleteAmountToPay.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-2" />

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t('totalAmountToPay')}</span>
                  <span>€{totalAmountToPay.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <span>{t('inscriptions:processingFee')}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          {t('inscriptions:processingFeeTooltip', {
                            baseFee: BASE_FEE.toFixed(2),
                            variableFeeRate: (VARIABLE_FEE_RATE * 100).toFixed(0),
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span>€{processingFee.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-bold text-lg">
                <span>{t('total')}</span>
                <span>€{finalTotal.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              {/* Athletes breakdown for free registrations */}
              <div className="space-y-2 mb-3">
                {registrations.map((registration, index) => {
                  const eventCount = registration.inscriptions.length;
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {registration.athlete.firstName} {registration.athlete.lastName}{' '}
                        <span className="text-muted-foreground">
                          ({eventCount} {eventCount === 1 ? t('event.text') : t('events.text')})
                        </span>
                      </span>
                      <span>€0.00</span>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-2" />

              <div className="flex justify-between font-bold text-lg">
                <span>{t('total')}</span>
                <span>€{finalTotal.toFixed(2)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-2">
        <Button onClick={goToForm} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {t('inscriptions:addAnotherAthlete')}
        </Button>

        <Button
          onClick={handleProceedToPayment}
          className="w-full"
          size="lg"
          disabled={createInscriptions.isPending}
        >
          {finalTotal > 0 && <CreditCard className="w-4 h-4 mr-2" />}
          {createInscriptions.isPending
            ? t('inscriptions:processing')
            : finalTotal > 0
              ? t('inscriptions:proceedToPayment')
              : t('inscriptions:confirmRegistration')}
        </Button>
      </div>
    </div>
  );
}

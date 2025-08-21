import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from '@/components/ui/stepper';
import { useRequiredCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import { useInscriptionFormStore } from '@/store/inscription-form-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Id$, Record$ } from '@repo/core/schemas';
import { ChevronLeft, ChevronRight, Eye, ShoppingCart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { AthleteSelectionStep, EventSelectionStep, RecordsEntryStep } from './steps';

const steps = [
  { id: 1, title: 'Athlete' },
  { id: 2, title: 'Events' },
  { id: 3, title: 'Records' },
];

const InscriptionForm$ = z.object({
  athleteId: Id$,
  competitionEventIds: z.array(Id$).min(1),
  records: z.record(
    Id$,
    Record$.pick({
      performanceValue: true,
      location: true,
    }),
  ),
});

export function InscriptionForm() {
  const eid = useCompetitionEid();
  const { t } = useTranslation(['inscriptions', 'buttons']);
  const competition = useRequiredCompetition(eid);

  const {
    currentStep,
    registrations,
    setStep,
    nextStep,
    previousStep,
    canProceedToNextStep,
    goToBasket,
    hasRegistrations,
  } = useInscriptionFormStore();

  const form = useForm({
    resolver: zodResolver(InscriptionForm$),
    defaultValues: {
      competitionEventIds: [],
      records: {},
    },
  });

  const handleNext = () => {
    if (canProceedToNextStep()) {
      nextStep();
    }
  };

  const calculateBasketTotal = () => {
    return registrations.reduce((total, registration) => {
      return (
        total +
        registration.inscriptions.reduce((regTotal, inscription) => {
          const event = competition.events.find(e => e.id === inscription.competitionEventId);
          return regTotal + (event?.price || 0);
        }, 0)
      );
    }, 0);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AthleteSelectionStep />;
      case 2:
        return <EventSelectionStep />;
      case 3:
        return <RecordsEntryStep />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto space-y-6">
      {/* Header with basket access */}
      {hasRegistrations() && (
        <div className="flex items-center justify-end">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {registrations.length} {t('athletes')}
                <Badge variant="secondary" className="ml-2">
                  €{calculateBasketTotal().toFixed(2)}
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-medium">{t('registrationBasket')}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {registrations.map((registration, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">
                        {registration.athlete.firstName} {registration.athlete.lastName}
                      </div>
                      <div className="text-muted-foreground">
                        {registration.inscriptions.length} {t('events')}
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={goToBasket} className="w-full" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  {t('viewBasket')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('athleteRegistration')}</h1>
        <p className="text-muted-foreground">
          {t('step')} {currentStep} {t('of')} 3
        </p>
      </div>

      {/* Main Form Area */}
      <div className="mx-auto max-w-xl space-y-8 text-center min-w-[300px]">
        {/* Progress Stepper */}
        <Stepper value={currentStep} onValueChange={setStep}>
          {steps.map((step, index) => (
            <StepperItem
              key={step.id}
              step={step.id}
              className="[&:not(:last-child)]:flex-1"
              completed={currentStep > step.id}
            >
              <StepperTrigger asChild>
                <StepperIndicator />
              </StepperTrigger>
              {index < steps.length - 1 && <StepperSeparator />}
            </StepperItem>
          ))}
        </Stepper>

        {/* Step Content */}
        <Form {...form}>
          <div className="bg-card rounded-lg border p-6">{renderStepContent()}</div>
        </Form>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={previousStep} disabled={currentStep === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('back', { ns: 'buttons' })}
          </Button>

          <Button onClick={handleNext} disabled={!canProceedToNextStep()}>
            {currentStep === 3 ? t('addToBasket') : t('next', { ns: 'buttons' })}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

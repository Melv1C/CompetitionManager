import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from '@repo/ui';
import { ChevronLeft, ChevronRight, Eye, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAthleteBlockStatus } from '../../hooks/use-athlete-registration-status';
import { useInscriptionFormStore } from '../../store/inscription-form-store';
import { AthleteSelectionStep, EventSelectionStep, RecordsEntryStep } from './steps';

const steps = [
  { id: 1, title: 'Athlete' },
  { id: 2, title: 'Events' },
  { id: 3, title: 'Records' },
];

export function InscriptionForm() {
  const { t } = useTranslation();

  const { currentStep } = useInscriptionFormStore();

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
      <InscriptionBasketHeader />

      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('inscriptions:athleteRegistration')}</h1>
        <p className="text-muted-foreground">
          {t('step')} {currentStep} {t('of')} {steps.length}
        </p>
      </div>

      {/* Main Form Area */}
      <div className="mx-auto max-w-xl space-y-8 text-center min-w-[300px]">
        {/* Progress Stepper */}
        <Stepper value={currentStep}>
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
        <div className="bg-card rounded-lg border p-6">{renderStepContent()}</div>

        <InscriptionFormNavigation />
      </div>
    </div>
  );
}

function InscriptionBasketHeader() {
  const { t } = useTranslation();
  const { goToBasket, hasRegistrations, registrations } = useInscriptionFormStore();

  if (!hasRegistrations()) return null;

  return (
    <div className="flex items-center justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <ShoppingCart className="w-4 h-4 mr-2" />
            {registrations.length} {t('inscriptions:athletes')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-medium">{t('inscriptions:registrationBasket')}</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {registrations.map((registration, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium">
                    {registration.athlete.firstName} {registration.athlete.lastName}
                  </div>
                  <div className="text-muted-foreground">
                    {registration.inscriptions.length} {t('events.text')}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={goToBasket} className="w-full" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              {t('inscriptions:viewBasket')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function InscriptionFormNavigation() {
  const { t } = useTranslation();
  const { currentStep, currentAthlete, nextStep, previousStep, canProceedToNextStep } =
    useInscriptionFormStore();
  const { isBlocked } = useAthleteBlockStatus(currentAthlete);

  const isCurrentStepBlocked = currentStep === 1 && isBlocked;
  const canProceed = canProceedToNextStep() && !isCurrentStepBlocked;

  const handleNext = () => {
    if (canProceed) {
      nextStep();
    }
  };

  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={previousStep} disabled={currentStep === 1}>
        <ChevronLeft className="w-4 h-4 mr-1" />
        {t('buttons:back')}
      </Button>

      <Button onClick={handleNext} disabled={!canProceed}>
        {currentStep === 3 ? t('inscriptions:addToBasket') : t('buttons:next')}
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

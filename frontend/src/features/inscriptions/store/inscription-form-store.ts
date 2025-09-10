import type { Athlete, Id, UpsertInscription, UpsertRecord } from '@repo/core/schemas';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AthleteRegistration {
  athlete: Athlete;
  inscriptions: UpsertInscription[];
}

export interface InscriptionFormStore {
  // Form state (now 3 steps: Athlete, Events, Records)
  currentStep: number;
  currentAthlete: Athlete | undefined;
  currentEventIds: Id[];
  currentRecords: Record<Id, UpsertRecord>;

  // Basket/registrations state
  registrations: AthleteRegistration[];

  // View state
  isInBasketView: boolean;

  // Actions for current form
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;

  // Actions for current athlete
  setCurrentAthlete: (athlete?: Athlete) => void;
  setCurrentEventIds: (eventIds: Id[]) => void;
  setCurrentRecord: (eventId: Id, record: UpsertRecord | null) => void;

  // Actions for managing registrations/basket
  addCurrentRegistration: () => void;
  removeRegistration: (athleteId: Id) => void;
  modifyRegistration: (athleteId: Id) => void;
  clearBasket: () => void;

  // View navigation
  goToForm: () => void;
  goToBasket: () => void;

  // Computed values
  canProceedToNextStep: () => boolean;
  hasRegistrations: () => boolean;
}

export const useInscriptionFormStore = create<InscriptionFormStore>()(
  devtools(
    (set, get) => ({
      // Initial state (3 steps: Athlete, Events, Records)
      currentStep: 1,
      currentAthlete: undefined,
      currentEventIds: [],
      currentRecords: {},
      registrations: [],
      isInBasketView: false,

      // Step management (max 3 steps now)
      setStep: step => set({ currentStep: Math.min(Math.max(step, 1), 3) }),
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 3) {
          set({ currentStep: currentStep + 1 });
        } else if (currentStep === 3) {
          // After step 3, add to basket and go to basket view
          get().addCurrentRegistration();
        }
      },
      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      // Current athlete management
      setCurrentAthlete: athlete => set({ currentAthlete: athlete }),
      setCurrentEventIds: eventIds => set({ currentEventIds: eventIds }),
      setCurrentRecord: (eventId, record) =>
        set(state => ({
          currentRecords: record
            ? { ...state.currentRecords, [eventId]: record }
            : Object.fromEntries(
                Object.entries(state.currentRecords).filter(([id]) => id !== eventId.toString()),
              ),
        })),

      // Registration/basket management
      addCurrentRegistration: () => {
        const { currentAthlete, currentEventIds, currentRecords, registrations } = get();

        if (!currentAthlete || currentEventIds.length === 0) return;

        const inscriptions: UpsertInscription[] = currentEventIds.map(eventId => ({
          athleteId: currentAthlete.id,
          competitionEventId: eventId,
          record: currentRecords[eventId] || undefined,
        }));

        const newRegistration: AthleteRegistration = {
          athlete: currentAthlete,
          inscriptions,
        };

        set({
          registrations: [...registrations, newRegistration],
          // Reset current form and go to basket view
          currentAthlete: undefined,
          currentEventIds: [],
          currentRecords: {},
          currentStep: 1,
          isInBasketView: true,
        });
      },

      removeRegistration: athleteId =>
        set(state => ({
          registrations: state.registrations.filter(reg => reg.athlete.id !== athleteId),
        })),

      modifyRegistration: athleteId => {
        const { registrations } = get();
        const registration = registrations.find(reg => reg.athlete.id === athleteId);

        if (registration) {
          // Extract records from inscriptions
          const records = registration.inscriptions.reduce(
            (acc, inscription) => {
              if (inscription.record) {
                acc[inscription.competitionEventId] = inscription.record;
              }
              return acc;
            },
            {} as Record<Id, UpsertRecord>,
          );

          set({
            // Populate form with registration data
            currentAthlete: registration.athlete,
            currentEventIds: registration.inscriptions.map(ins => ins.competitionEventId),
            currentRecords: records,
            currentStep: 1,
            isInBasketView: false,
            // Remove from registrations
            registrations: registrations.filter(reg => reg.athlete.id !== athleteId),
          });
        }
      },

      clearBasket: () =>
        set({
          currentStep: 1,
          isInBasketView: false,
          registrations: [],
          currentAthlete: undefined,
          currentEventIds: [],
          currentRecords: {},
        }),

      // View navigation
      goToForm: () =>
        set({
          currentStep: 1,
          currentAthlete: undefined,
          currentEventIds: [],
          currentRecords: {},
          isInBasketView: false,
        }),

      goToBasket: () =>
        set({
          isInBasketView: true,
        }),

      // Computed values
      canProceedToNextStep: () => {
        const { currentStep, currentAthlete, currentEventIds } = get();
        switch (currentStep) {
          case 1:
            return !!currentAthlete;
          case 2:
            return currentEventIds.length > 0;
          case 3:
            return true; // Records are optional
          default:
            return false;
        }
      },

      hasRegistrations: () => {
        const { registrations } = get();
        return registrations.length > 0;
      },
    }),
    { name: 'inscription-form-store' },
  ),
);

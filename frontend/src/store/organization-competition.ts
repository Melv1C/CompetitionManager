import type { Competition } from '@repo/core/schemas';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface OrganizationCompetitionStore {
  currentCompetition: Competition | null;
  setCompetition: (competition: Competition) => void;
  clearCompetition: () => void;
}

export const useOrganizationCompetitionStore =
  create<OrganizationCompetitionStore>()(
    devtools(
      (set) => ({
        currentCompetition: null,
        setCompetition: (competition) =>
          set({ currentCompetition: competition }),
        clearCompetition: () => set({ currentCompetition: null }),
      }),
      { name: 'organization-competition-store' }
    )
  );

import type { Competition } from '@repo/core/schemas';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CompetitionStore {
  currentCompetition: Competition | null;
  setCompetition: (competition: Competition) => void;
  clearCompetition: () => void;
}

export const useCompetitionStore = create<CompetitionStore>()(
  devtools(
    (set) => ({
      currentCompetition: null,
      setCompetition: (competition) => set({ currentCompetition: competition }),
      clearCompetition: () => set({ currentCompetition: null }),
    }),
    { name: 'competition-store' }
  )
);

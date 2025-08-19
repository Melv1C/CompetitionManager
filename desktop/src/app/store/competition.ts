import type { Competition, Cuid } from '@repo/core/schemas';
import { create } from 'zustand';

interface CompetitionStore {
  competitionEid: Cuid | null;
  setCompetition: (competition: Competition) => void;
  resetCompetition: () => void;
}

export const useCompetitionStore = create<CompetitionStore>(set => ({
  competitionEid: null,
  setCompetition: competition => set({ competitionEid: competition.eid }),
  resetCompetition: () => set({ competitionEid: null }),
}));

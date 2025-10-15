import type { Competition } from '@repo/core/schemas';

declare global {
  interface Window {
    electron: {
      importCompetition: (competition: Competition) => void;
      importAthletes: (inscriptions: Inscription[], competitionId: number) => void;
      exportCompetition: () => Promise<Competition>;
    };
  }

  type EventPayloadMapping = {
    importCompetition: void;
    importAthletes: void;
    exportCompetition: Promise<Competition>;
  };
}

export {};
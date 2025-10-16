import type { Competition } from '@repo/core/schemas';

declare global {
  interface Window {
    electron: {
      importCompetition: (competition: Competition, recreate: boolean = false) => void;
      importAthletes: (
        inscriptions: Inscription[],
        competitionId: number,
        competitionStartDate: Date,
      ) => void;
      getStatus: (
        competition: Competition,
      ) => Promise<{ competitionExist: boolean; events: string[] }>;
      exportCompetition: () => Promise<Competition>;
    };
  }

  type EventPayloadMapping = {
    importCompetition: void;
    importAthletes: void;
    getStatus: Promise<{ competitionExist: boolean; events: string[] }>;
    exportCompetition: Promise<Competition>;
  };
}

export {};
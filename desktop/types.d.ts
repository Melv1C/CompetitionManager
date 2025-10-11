import type { Competition } from '@repo/core/schemas';

declare global {
  interface Window {
    electron: {
      importCompetition: (competition: Competition) => void;
      exportCompetition: () => Promise<Competition>;
    };
  }

  type EventPayloadMapping = {
    importCompetition: void;
    exportCompetition: Promise<Competition>;
  };
}

export {};
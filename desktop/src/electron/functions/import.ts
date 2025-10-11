import { Competition } from '@repo/core/schemas';
import { createCompetition } from '../sql/createCompetition.js';
import { createEvent } from '../sql/createEvent.js';

export const importCompetition = async (competition: Competition) => {
  const competitionId = await createCompetition(competition);
  for (const event of competition.events) {
    await createEvent(event, competitionId);
  }
};

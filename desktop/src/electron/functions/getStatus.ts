import { Competition } from '@repo/core/schemas';
import { competitionExists } from '../sql/exist.js';
import { getExistingEventsNames } from '../sql/getExistingEventsNames.js';

export const getStatus = async (competition: Competition) => {
  const competitionExist = await competitionExists(competition.id);
  return { 
    competitionExist, 
    events: competitionExist ? await getExistingEventsNames(competition.id) : []
  };
};

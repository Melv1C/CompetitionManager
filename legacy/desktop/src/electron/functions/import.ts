import { Competition, Inscription } from '@repo/core/schemas';
import { createCompetition } from '../sql/createCompetition.js';
import { createEvent } from '../sql/createEvent.js';
import { competitionExists, eventExists } from '../sql/exist.js';
import { deleteCompetition, deleteEvent } from '../sql/delete.js';
import { createAthlete } from '../sql/createAthlete.js';

export const importCompetition = async (competition: Competition, recreate: boolean = false) => {
  console.log(`Importing competition with ID ${competition.id}`);
  if (await competitionExists(competition.id)) {
    if (!recreate) {
      console.log(`Competition with ID ${competition.id} already exists. Skipping import.`);
      await importEvents(competition, recreate);
      return;
    }
    await deleteCompetition(competition.id);
  }
  await createCompetition(competition);
  await importEvents(competition, recreate);
};

const importEvents = async (competition: Competition, recreate: boolean = false) => {
  for (const event of competition.events) {
    if (await eventExists(event.name, competition.id)) {
      if (!recreate) {
        console.log(
          `Event ${event.name} already exists in competition ID ${competition.id}. Skipping import.`,
        );
        continue;
      }
      await deleteEvent(event.name, competition.id);
    }
    await createEvent(event, competition.id);
  }
};

export const importAthletes = async (
  inscriptions: Inscription[],
  competitionId: number,
  competitionStartDate: Date,
) => {
  console.log(`Importing ${inscriptions.length} athletes for competition ID ${competitionId}`);
  for (const inscription of inscriptions) {
    console.log(
      `Importing athlete ${inscription.athlete.firstName} ${inscription.athlete.lastName}`,
    );
    await createAthlete(inscription, competitionId, competitionStartDate);
  }
};

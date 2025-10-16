import { CompetitionEvent } from '@repo/core/schemas';

import { prisma } from '../lib/prisma.js';
import { AMEventCategories, AMEventsSchema, AMRoundSchema } from '../schemas/index.js';
import { getNextSeqno } from './utils/getNextSeqno.js';

export const createEvent = async (event: CompetitionEvent, competitionId: number) => {
  const amEvent = AMEventsSchema.parse({
    name: event.name,
    abbreviation: event.event.abbr,
    since: event.eventStartTime,
    competition: competitionId,
    seqno: await getNextSeqno(prisma.events, { competition: competitionId }),
  });
  const createdEvent = await prisma.events.create({
    data: amEvent,
  });
  console.log('Created event with ID:', createdEvent.id);

  //neet to also create the event categories
  if (event.categories && event.categories.length > 0) {
    for (const category of event.categories) {
      const amEventCategory = AMEventCategories.parse({
        event: createdEvent.id,
        category: category.amId,
      });
      await prisma.eventcategories.create({
        data: amEventCategory,
      });
      console.log(
        'Creating event category for event ID:',
        createdEvent.id,
        'and category ID:',
        category.id,
      );
    }
  }

  //need to also create the round
  const amRound = AMRoundSchema.parse({
    event: createdEvent.id,
    timesheduled: event.eventStartTime,
    seqno: await getNextSeqno(prisma.rounds, { event: createdEvent.id }),
  });
  await prisma.rounds.create({
    data: amRound,
  });
  return createdEvent.id;
};

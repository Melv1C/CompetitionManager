import { prisma } from '../lib/prisma.js';

export const getExistingEventsNames = async (competitionId: number): Promise<string[]> => {
  const existingEvents = await prisma.events.findMany({
    where: {
      competition: competitionId,
      name: { not: null },
    },
    select: { name: true },
  });
  return existingEvents.map(event => event.name!); // Non-null assertion because of the 'not: null' filter
};

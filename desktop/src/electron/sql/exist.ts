import { prisma } from '../lib/prisma.js';

export const competitionExists = async (competitionId: number) => {
  const existingCompetition = await prisma.competitions.findUnique({
    where: { id: competitionId },
  });
  return !!existingCompetition;
};

export const eventExists = async (eventName: string, competitionId: number) => {
  const existingEvent = await prisma.events.findFirst({
    where: { name: eventName, competition: competitionId },
  });
  return !!existingEvent;
};

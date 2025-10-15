import { prisma } from '../lib/prisma.js';

export const findIdCompetitor = async (athleteId: number, license: number) => {
  const existingCompetitor = await prisma.competitors.findFirst({
    where: { athlete: athleteId, license: license },
  });
  return existingCompetitor ? existingCompetitor.id : null;
};

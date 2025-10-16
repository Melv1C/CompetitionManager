import { prisma } from '../lib/prisma.js';
import { AMParticipationSchema } from '../schemas/AMParticipation.js';

export const createParticipation = async (roundId: number, categoryId: number) => {
  const participation = AMParticipationSchema.parse({
    round: roundId,
    category: categoryId,
  });

  await prisma.participations.create({
    data: participation,
  });
};

import { Competition } from '@repo/core/schemas';

import { PrismaClient } from '../generated/prisma/index.js';
import { AMCompetitionSchema } from '../schemas/AMCompetition.js';
const prisma = new PrismaClient();

export const createCompetition = async (competition: Competition) => {
  const amCompetition = AMCompetitionSchema.parse({
    name: competition.name,
    location: competition.location,
    startdate: competition.startDate,
    enddate: competition.endDate,
    referencedate: competition.startDate, // TODO check if correct
  });
  const createdCompetition = await prisma.competitions.create({
    data: amCompetition,
  });
  console.log('Created competition with ID:', createdCompetition.id);
  return createdCompetition.id;
};

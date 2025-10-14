import { Athlete, Inscription } from '@repo/core/schemas';
import { getSeasonBib } from '@repo/core/utils/athlete-utils.js';
import { prisma } from '../lib/prisma.js';
import { AMCompetitorSchema } from '../schemas/AMCompetitior.js';

export const createAthlete = async (inscriptions: Inscription[]) => {
  for (const inscription of inscriptions) {
    const { licenseId, athleteId } = await getAthleteAmIds(inscription.athlete);
    if (athleteId && licenseId) {
      await createCompetitor(
        inscription.athlete,
        licenseId,
        athleteId,
        1,
      );
    }else {
      throw new Error(`Athlete or License not found for athlete ${inscription.athlete.firstName} ${inscription.athlete.lastName} with license ${inscription.athlete.license}`);
    }
  }
};

const getAthleteAmIds = async (athlete: Athlete) => {
  const license = await prisma.licenses.findFirst({
    where: {
      licensenumber: athlete.license,
      athleteData: {
        firstname: athlete.firstName,
        lastname: athlete.lastName,
      },
    },
    include: {
      athleteData: true,
    },
  });
  return { licenseId: license?.id, athleteId: license?.athleteData?.id };
};

const createCompetitor = async (
  athlete: Athlete,
  licenseId: number,
  athleteId: number,
  competitionId: number,
) => {
  const competitor = AMCompetitorSchema.parse({
    athlete: athleteId,
    license: licenseId,
    competition: competitionId,
    bib: getSeasonBib(athlete, new Date())?.toString(),
    displayname: `${athlete.lastName}, ${athlete.firstName}`,
  });

  await prisma.competitors.create({
    data: competitor,
  });
};

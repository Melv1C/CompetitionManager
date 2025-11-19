import { Athlete, CompetitionEvent, Inscription } from '@repo/core/schemas';
import { getAthleteCategory, getSeasonBib } from '@repo/core/utils/athlete-utils.js';
import { prisma } from '../lib/prisma.js';
import {
  AMCompetitorSchema,
  AMParticipantSchema,
  AMParticipationSchema,
} from '../schemas/index.js';
import { participantExists } from './exist.js';
import { findIdCompetitor } from './findId.js';

export const createAthlete = async (
  inscription: Inscription,
  competitionId: number,
  competitionStartDate: Date,
) => {
  console.log(`Creating athlete ${inscription.athlete.firstName} ${inscription.athlete.lastName}`);
  const { licenseId, athleteId } = await getAthleteAmIds(inscription.athlete);
  if (!athleteId || !licenseId) {
    throw new Error(
      `Athlete or License not found for athlete ${inscription.athlete.firstName} ${inscription.athlete.lastName} with license ${inscription.athlete.license}`,
    );
  }
  let competitorId = await findIdCompetitor(athleteId, licenseId);
  if (!competitorId) {
    competitorId = await createCompetitor(inscription.athlete, licenseId, athleteId, competitionId);
  }
  const roundId = await getAMRoundId(inscription.competitionEvent, competitionId);
  if (!(await participantExists(competitorId, roundId))) {
    // The getAthleteCategory create the categorie on itself based on agec so we need to find the amId with the coategories of the event
    const possibleCategories = inscription.competitionEvent.categories;
    const calculatedCat = getAthleteCategory(inscription.athlete, competitionStartDate);
    for (const cat of possibleCategories) {
      if (cat.abbr === calculatedCat.abbr) {
        calculatedCat.amId = cat.amId;
        break;
      }
    }
    const participationId = await createParticipation(roundId, calculatedCat.amId);
    await createParticipant(competitorId, participationId);
  }
};

const getAMRoundId = async (event: CompetitionEvent, competitionId: number) => {
  const amRound = await prisma.rounds.findFirst({
    where: {
      events: {
        name: event.name,
        competition: competitionId,
      },
    },
    include: {
      events: true,
    },
  });
  if (!amRound)
    throw new Error(`Round not found for event ${event.name} in competition ID ${competitionId}`);
  return amRound.id;
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

  const newCompetitor = await prisma.competitors.create({
    data: competitor,
  });
  return newCompetitor.id;
};

export const createParticipation = async (roundId: number, categoryId: number) => {
  const participation = AMParticipationSchema.parse({
    round: roundId,
    category: categoryId,
  });

  const newParticipation = await prisma.participations.create({
    data: participation,
  });
  return newParticipation.id;
};

export const createParticipant = async (competitorId: number, participationId: number) => {
  const participant = AMParticipantSchema.parse({
    competitor: competitorId,
    participation: participationId,
  });

  await prisma.participants.create({
    data: participant,
  });
};

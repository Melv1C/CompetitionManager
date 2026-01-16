import { env } from '@/lib/env';
import { prisma } from '@repo/database';
import { getSeason } from '@repo/utils';
import axios from 'axios';
import { logger } from 'better-auth';

interface AthleteData {
  license: string;
  bib: number;
  firstName: string;
  lastName: string;
  gender: string;
  birthdate: Date;
  clubAbbr: string;
}

const isValidAthlete = (athlete: AthleteData): boolean => {
  if (!athlete.license || !athlete.firstName || !athlete.lastName) return false;
  if (athlete.birthdate < new Date('1900-01-01')) return false;
  if (athlete.birthdate > new Date()) return false;
  return true;
};

const getOrCreateClub = async (clubAbbr: string) => {
  const existingClub = await prisma.club.findUnique({
    where: { abbr: clubAbbr },
  });

  if (existingClub) {
    return existingClub;
  }

  try {
    const { data } = await axios.get(`https://www.beathletics.be/api/club/${clubAbbr}`);

    const club = await prisma.club.create({
      data: {
        name: data.name,
        abbr: data.abbr,
        address: data.areaServed || null,
        province: data.province || null,
        country: data.federation?.country || null,
        fedNumber: data.fedNumber || null,
        fedAbbr: data.federation?.abbr || null,
      },
    });
    logger.info(`Created club ${clubAbbr}`, club);
    return club;
  } catch (error) {
    logger.error(`Failed to fetch club data for ${clubAbbr}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Create minimal club record as fallback
    return await prisma.club.create({
      data: {
        name: clubAbbr,
        abbr: clubAbbr,
        address: null,
        province: null,
        country: 'Belgique',
        fedNumber: null,
        fedAbbr: null,
      },
    });
  }
};

/**
 * Fetch athletes from LBFA API and sync to database
 */
export const fetchAndSyncAthlete = async (): Promise<{
  created: number;
  updated: number;
  skipped: number;
}> => {
  const athletes: Array<{
    license: string;
    bib: number;
    firstName: string;
    lastName: string;
    gender: string;
    birthdate: Date;
    clubAbbr: string;
  }> = [];

  if (!env.LBFA_URL || !env.LBFA_USERNAME || !env.LBFA_PASSWORD) {
    throw new Error(
      'LBFA API configuration is incomplete. Please provide lbfaUrl, lbfaUsername, and lbfaPassword.',
    );
  }
  const { data } = await axios.get(env.LBFA_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'http://www.google.com/',
      Connection: 'keep-alive',
    },
    auth: {
      username: env.LBFA_USERNAME,
      password: env.LBFA_PASSWORD,
    },
  });

  const lines = data.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].split('\t');
    if (parseInt(line[0]) <= 10000) {
      continue;
    }
    athletes.push({
      license: line[0],
      bib: parseInt(line[1]),
      firstName: line[3],
      lastName: line[4],
      gender: line[5],
      birthdate: new Date(line[6]),
      clubAbbr: line[9],
    });
  }

  const currentSeason = getSeason();

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const athleteData of athletes) {
    if (parseInt(athleteData.license) <= 10000) {
      skipped++;
      continue;
    }

    // Validate athlete data
    if (!isValidAthlete(athleteData)) {
      logger.warn('Invalid athlete data', athleteData);
      skipped++;
      continue;
    }

    try {
      // Get or create club
      const club = await getOrCreateClub(athleteData.clubAbbr);

      // Find existing athlete
      const existingAthlete = await prisma.athlete.findFirst({
        where: { license: athleteData.license },
        include: { athleteInfo: { where: { season: currentSeason } } },
      });

      if (existingAthlete) {
        // Update athlete info for current season
        const hasCurrentSeasonInfo = existingAthlete.athleteInfo.length > 0;

        // Update athlete details if necessary
        if (
          existingAthlete.firstName !== athleteData.firstName ||
          existingAthlete.lastName !== athleteData.lastName
        ) {
          await prisma.athlete.update({
            where: { id: existingAthlete.id },
            data: {
              firstName: athleteData.firstName,
              lastName: athleteData.lastName,
              gender: athleteData.gender,
              birthdate: athleteData.birthdate,
            },
          });
          updated++;
        }

        if (!hasCurrentSeasonInfo) {
          await prisma.athleteInfo.create({
            data: {
              athleteId: existingAthlete.id,
              season: currentSeason,
              clubId: club.id,
              bib: athleteData.bib,
            },
          });
          created++;
          logger.info('Created new season info for athlete', {
            ...athleteData,
            club: club.abbr,
            season: currentSeason,
          });
        } else {
          // Update existing season info
          await prisma.athleteInfo.update({
            where: {
              athleteId_season: {
                athleteId: existingAthlete.id,
                season: currentSeason,
              },
            },
            data: {
              clubId: club.id,
              bib: athleteData.bib,
            },
          });
        }
      } else {
        // Create new athlete with season info
        await prisma.athlete.create({
          data: {
            license: athleteData.license,
            firstName: athleteData.firstName,
            lastName: athleteData.lastName,
            gender: athleteData.gender,
            birthdate: athleteData.birthdate,
            athleteInfo: {
              create: {
                season: currentSeason,
                clubId: club.id,
                bib: athleteData.bib,
              },
            },
          },
        });
        created++;
        logger.info('Created new athlete', {
          ...athleteData,
          club: club.abbr,
          season: currentSeason,
        });
      }
    } catch (error) {
      logger.error('Error processing athlete', {
        athlete: athleteData,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      skipped++;
    }
  }

  return { created, updated, skipped };
};

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import type { Logger } from 'winston';
import { scheduler } from './scheduler';
import mockAthletesData from '@/data/mock-athletes.json';

export interface AthleteSyncConfig {
  enabled: boolean;
  cronExpression: string;
  lbfaUrl: string;
  lbfaUsername: string;
  lbfaPassword: string;
  useMock: boolean;
}

export interface AthleteSyncResult {
  athletes: {
    created: number;
    updated: number;
    skipped: number;
  };
  clubs: {
    created: number;
    skipped: number;
  };
}

export class AthleteSyncService {
  private config: AthleteSyncConfig;
  private prodLogger: Logger | null = null;

  constructor(config: AthleteSyncConfig) {
    this.config = config;
    if (process.env.NODE_ENV === 'production') {
      this.prodLogger = logger;
    }
  }
  /**
   * Initialize the service and register with scheduler
   */
  async initialize(): Promise<AthleteSyncResult | null> {
    if (!this.config.enabled) {
      this.prodLogger?.info('Athlete sync service disabled');
      return null;
    }

    // Launch the initial sync immediately
    this.prodLogger?.info('Initializing athlete sync service...');
    try {
      const initialResult = await this.syncAthletes();
      this.prodLogger?.info('Initial athlete sync completed', initialResult);
    } catch (error) {
      this.prodLogger?.error('Error during initial athlete sync', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }

    // Register the sync task
    scheduler.register({
      name: 'athlete-sync',
      cronExpression: this.config.cronExpression,
      handler: async () => {
        await this.syncAthletes();
      },
      enabled: this.config.enabled,
    });

    this.prodLogger?.info('Athlete sync service initialized');
    return null;
  }

  /**
   * Main synchronization function
   */
  async syncAthletes(): Promise<AthleteSyncResult> {
    const result: AthleteSyncResult = {
      athletes: { created: 0, updated: 0, skipped: 0 },
      clubs: { created: 0, skipped: 0 },
    };

    try {
      this.prodLogger?.info('Starting athlete synchronization...');

      // Then sync athletes from LBFA
      const athleteResult = await this.fetchAndSyncAthletes();
      result.athletes = athleteResult;

      this.prodLogger?.info('Athlete synchronization completed', result);
      return result;
    } catch (error) {
      logger.error('Error during athlete synchronization', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Fetch athletes from LBFA API and sync to database
   */
  private async fetchAndSyncAthletes(): Promise<{
    created: number;
    updated: number;
    skipped: number;
  }> {
    let athletes: Array<{
      license: string;
      bib: number;
      firstName: string;
      lastName: string;
      gender: string;
      birthdate: Date;
      clubAbbr: string;
    }> = [];

    if (this.config.useMock) {
      athletes = mockAthletesData.map((a) => ({
        ...a,
        birthdate: new Date(a.birthdate),
      }));
    } else {
      const { data } = await axios.get(this.config.lbfaUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          Referer: 'http://www.google.com/',
          Connection: 'keep-alive',
        },
        auth: {
          username: this.config.lbfaUsername,
          password: this.config.lbfaPassword,
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
    }

    const currentSeason = new Date().getFullYear();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const athleteData of athletes) {
      if (parseInt(athleteData.license) <= 10000) {
        skipped++;
        continue;
      }

      // Validate athlete data
      if (!this.isValidAthlete(athleteData)) {
        logger.warn('Invalid athlete data', athleteData);
        skipped++;
        continue;
      }

      try {
        // Get or create club
        const club = await this.getOrCreateClub(athleteData.clubAbbr);

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
  }

  /**
   * Validate athlete data
   */
  private isValidAthlete(athlete: any): boolean {
    if (!athlete.license || !athlete.firstName || !athlete.lastName)
      return false;
    if (athlete.birthdate < new Date('1900-01-01')) return false;
    if (athlete.birthdate > new Date()) return false;
    return true;
  }

  /**
   * Get existing club or create new one from API
   */
  private async getOrCreateClub(clubAbbr: string) {
    const existingClub = await prisma.club.findUnique({
      where: { abbr: clubAbbr },
    });

    if (existingClub) {
      return existingClub;
    }

    try {
      const { data } = await axios.get(
        `https://www.beathletics.be/api/club/${clubAbbr}`
      );

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
  }

  /**
   * Get service configuration
   */
  getConfig(): AthleteSyncConfig {
    return { ...this.config };
  }

  /**
   * Manual trigger for sync (useful for admin endpoints)
   */
  async triggerSync(): Promise<AthleteSyncResult> {
    return await this.syncAthletes();
  }
}

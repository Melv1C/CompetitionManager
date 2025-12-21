import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { getRedisClient } from '@/lib/redis';
import {
  BeathleticsApiResponseBase$,
  BeathleticsResultItem,
  BeathleticsResultItem$,
} from '@/schemas/beathletics';
import {
  AthleteBestPerformancesResponse,
  CachedAthletePerformances,
  EventType,
  Performance,
} from '@repo/core/schemas';
import { sortPerf } from '@repo/core/utils';
import axios from 'axios';

const CACHE_KEY_PREFIX = 'athlete-performances:';

interface FetchPerformancesOptions {
  fromDate?: Date;
  forceRefresh?: boolean;
}

/**
 * Determines the event type from the result
 */
function getEventType(resultType?: string, perfType?: string): EventType {
  const type = (perfType ?? resultType ?? '').toLowerCase();
  if (type.includes('time')) return 'time';
  if (type.includes('height')) return 'height';
  if (type.includes('distance')) return 'distance';
  if (type.includes('points')) return 'points';
  return 'time'; // Default to time for track events
}

/**
 * Transforms a Beathletics result item into our Performance format
 */
function transformResultItem(item: BeathleticsResultItem): Performance | null {
  const result = item.result;
  if (!result) return null;

  const discipline = result.discipline;
  const competition = discipline?.competition;
  const trials = result.newTrials ?? [];

  // Get the best trial
  const bestTrial = trials.find(t => t.best) ?? trials[0];
  if (!bestTrial) return null;

  // Get performance value from trial
  const rawValue =
    bestTrial.trialJson?.perf ?? parseFloat(bestTrial.rankingPerf ?? bestTrial.perfLegacy ?? '');
  if (!rawValue || rawValue === 0) return null;

  // Determine event type
  const eventType = getEventType(
    discipline?.eventType?.result_type,
    bestTrial.perftype ?? bestTrial.trialJson?.perfType,
  );

  // Get event info
  const beathleticsEventType = discipline?.eventType;
  const eventName =
    beathleticsEventType?.name_fr ?? beathleticsEventType?.name_en ?? discipline?.name ?? 'Unknown';

  // Get competition date
  const competitionDate = competition?.startDate;
  if (!competitionDate) return null;

  return {
    eventName,
    eventType,
    value: rawValue,
    wind: bestTrial.windSpeed ? parseFloat(bestTrial.windSpeed) : null,
    date: competitionDate,
    location: competition?.name ?? 'Unknown',
  };
}

/**
 * Gets the best performance for each event from a list of performances
 */
function getBestPerformances(performances: Performance[], fromDate?: Date): Performance[] {
  // Filter by date if provided
  const filtered = fromDate ? performances.filter(p => new Date(p.date) >= fromDate) : performances;

  // Group by eventAbbr and find best for each
  const bestByEvent = new Map<string, Performance>();

  for (const perf of filtered) {
    const existing = bestByEvent.get(perf.eventName);
    if (!existing || sortPerf(perf.value, existing.value, perf.eventType) < 0) {
      bestByEvent.set(perf.eventName, perf);
    }
  }

  // Convert to BestPerformance format
  return Array.from(bestByEvent.values());
}

/**
 * Fetches athlete performances from Beathletics API and caches all results.
 * Returns the best performance for each event.
 */
export async function fetchAthleteBestPerformances(
  license: string,
  options: FetchPerformancesOptions = {},
): Promise<AthleteBestPerformancesResponse> {
  const redis = getRedisClient();
  const cacheKey = `${CACHE_KEY_PREFIX}${license}`;
  const { fromDate, forceRefresh } = options;

  // Try to get from cache first (unless force refresh)
  if (redis && !forceRefresh) {
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for athlete performances: ${license}`);
        const cached = JSON.parse(cachedData) as CachedAthletePerformances;

        // Calculate best performances from cached data
        const bestPerformances = getBestPerformances(cached.performances, fromDate);

        return {
          license,
          bestPerformances,
          cachedAt: cached.fetchedAt,
          fromDate: fromDate?.toISOString(),
        };
      }
    } catch (error) {
      logger.warn(`Redis cache read failed for ${license}:`, error);
    }
  }

  logger.info(`Fetching athlete performances from Beathletics: ${license}`);

  // Fetch from Beathletics API
  const url = `${env.BEATHLETICS_URL}/${license}`;

  try {
    const response = await axios.get(url, {
      timeout: env.PERFORMANCE_SERVICE_TIMEOUT,
      headers: {
        'User-Agent': 'CompetitionManager/1.0',
        Accept: 'application/json',
      },
    });

    // Parse base response structure
    const baseParseResult = BeathleticsApiResponseBase$.safeParse(response.data);

    if (!baseParseResult.success) {
      logger.warn(`Failed to parse Beathletics base response for ${license}:`, {
        errors: baseParseResult.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      });

      return {
        license,
        bestPerformances: [],
      };
    }

    const baseData = baseParseResult.data;
    logger.info(`Received ${baseData.results.length} raw results from Beathletics for ${license}`);

    // Parse each result individually to avoid one bad result invalidating all
    const validResults: BeathleticsResultItem[] = [];
    let parseErrors = 0;

    for (let i = 0; i < baseData.results.length; i++) {
      const rawResult = baseData.results[i];
      const resultParseResult = BeathleticsResultItem$.safeParse(rawResult);

      if (resultParseResult.success) {
        validResults.push(resultParseResult.data);
      } else {
        parseErrors++;
        if (parseErrors <= 10) {
          logger.debug(`Failed to parse result ${i} for ${license}:`, {
            errors: resultParseResult.error.issues.map(issue => ({
              path: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            })),
          });
          logger.debug('Raw result data:', (rawResult as Record<string, unknown>).result);
        }
      }
    }

    if (parseErrors > 0) {
      logger.warn(
        `Skipped ${parseErrors} invalid results out of ${baseData.results.length} for ${license}`,
      );
    }

    logger.info(`Parsed ${validResults.length} valid results from Beathletics for ${license}`);

    // Transform results into our format
    const performances: Performance[] = [];
    for (const resultItem of validResults) {
      const transformed = transformResultItem(resultItem);
      if (transformed) {
        performances.push(transformed);
      }
    }

    logger.info(`Transformed ${performances.length} performances for ${license}`);

    // Create cache entry with all performances
    const cacheEntry: CachedAthletePerformances = {
      license,
      performances,
      fetchedAt: new Date().toISOString(),
    };

    // Cache the result
    if (redis) {
      logger.info(`Caching ${performances.length} performances for ${license}`);
      try {
        await redis.setex(cacheKey, env.PERFORMANCE_CACHE_TTL, JSON.stringify(cacheEntry));
        logger.debug(
          `Cached athlete performances for ${license} (TTL: ${env.PERFORMANCE_CACHE_TTL}s)`,
        );
      } catch (error) {
        logger.warn(`Redis cache write failed for ${license}:`, error);
      }
    } else {
      logger.warn('Redis client not available, skipping caching');
    }

    // Calculate best performances
    const bestPerformances = getBestPerformances(performances, fromDate);

    return {
      license,
      bestPerformances,
      cachedAt: cacheEntry.fetchedAt,
      fromDate: fromDate?.toISOString(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        logger.error(`Beathletics API timeout for ${license}`);
      } else if (error.response?.status === 404) {
        logger.info(`Athlete not found in Beathletics: ${license}`);
      } else if (error.response?.status === 403) {
        logger.error(
          `Beathletics API access denied for ${license} (possibly Cloudflare protection)`,
        );
      } else {
        logger.error(`Beathletics API error for ${license}:`, {
          status: error.response?.status,
          message: error.message,
        });
      }
    } else {
      logger.error(`Unexpected error fetching performances for ${license}:`, error);
    }

    return {
      license,
      bestPerformances: [],
    };
  }
}

/**
 * Prefetches athlete performances and stores them in cache
 */
export async function prefetchAthletePerformances(license: string): Promise<void> {
  await fetchAthleteBestPerformances(license, { forceRefresh: false });
}

/**
 * Invalidates the cache for an athlete's performances
 */
export async function invalidatePerformanceCache(license: string): Promise<boolean> {
  const redis = getRedisClient();
  if (!redis) return false;

  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${license}`;
    await redis.del(cacheKey);
    logger.info(`Invalidated performance cache for ${license}`);
    return true;
  } catch (error) {
    logger.warn(`Failed to invalidate cache for ${license}:`, error);
    return false;
  }
}

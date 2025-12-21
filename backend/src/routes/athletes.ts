import { prisma } from '@/lib/prisma';
import { logError } from '@/utils/log-utils';
import {
  fetchAthleteBestPerformances,
  invalidatePerformanceCache,
  prefetchAthletePerformances,
} from '@/utils/performance-utils';
import { zValidator } from '@hono/zod-validator';
import {
  Athlete,
  Athlete$,
  AthleteInfo,
  AthleteKey$,
  Date$,
  athleteInclude,
} from '@repo/core/schemas';
import { Hono } from 'hono';
import { z } from 'zod';

const athletesRoutes = new Hono();

/**
 * Orders athletes based on search relevance
 * - Athletes with matching bib number appear first
 * - Then athletes with matching first name
 * - Then athletes with matching last name
 * - Finally all other athletes
 */
const orderAthletes = async (athletes: Athlete[], key: string) => {
  const athletesWithBib = athletes.filter(athlete =>
    athlete.athleteInfo.some((info: AthleteInfo) => info.bib === parseInt(key)),
  );
  const athletesWithFirstName = athletes.filter(athlete =>
    athlete.firstName.toLowerCase().startsWith(key.toLowerCase()),
  );
  const athletesWithLastName = athletes.filter(athlete =>
    athlete.lastName.toLowerCase().startsWith(key.toLowerCase()),
  );

  // Create a unique set while preserving order
  const uniqueAthletes = new Set([
    ...athletesWithBib,
    ...athletesWithFirstName,
    ...athletesWithLastName,
    ...athletes,
  ]);

  return Array.from(uniqueAthletes);
};

// GET /athletes - Search athletes by key
athletesRoutes.get(
  '/',
  zValidator(
    'query',
    z.object({
      key: AthleteKey$,
      refDate: Date$.optional().default(new Date()),
    }),
  ),
  async c => {
    try {
      const { key, refDate } = c.req.valid('query');
      const season = new Date(refDate).getFullYear();
      const keys = key.split(' ').filter(k => k.trim().length > 0);

      const athletes = await prisma.athlete.findMany({
        where: {
          AND: [
            {
              AND: keys.map(k => ({
                OR: [
                  { firstName: { contains: k, mode: 'insensitive' } },
                  { lastName: { contains: k, mode: 'insensitive' } },
                  // Search by bib number in athleteInfo
                  !isNaN(parseInt(k))
                    ? {
                        athleteInfo: {
                          some: {
                            bib: parseInt(k),
                            season: season,
                          },
                        },
                      }
                    : {},
                ],
              })),
            },
            // Only include athletes not associated with a competition
            { competitionId: null },
          ],
        },
        include: athleteInclude,
      });

      if (athletes.length === 0) {
        return c.json({ error: 'No athlete found' }, 404);
      }

      const validatedAthletes = Athlete$.array().parse(athletes);
      const sortedAthletes = await orderAthletes(validatedAthletes, key);

      return c.json(sortedAthletes);
    } catch (error) {
      logError('Failed to search athletes', error, c);
      return c.json({ error: 'Failed to search athletes' }, 500);
    }
  },
);

// GET /athletes/:license/best-performances - Get best performances per event from Beathletics
athletesRoutes.get(
  '/:license/best-performances',
  zValidator(
    'param',
    z.object({
      license: Athlete$.shape.license,
    }),
  ),
  zValidator(
    'query',
    z.object({
      fromDate: Date$.optional(),
      forceRefresh: z.stringbool().optional().default(false),
    }),
  ),
  async c => {
    try {
      const { license } = c.req.valid('param');
      const { fromDate, forceRefresh } = c.req.valid('query');

      const result = await fetchAthleteBestPerformances(license, {
        fromDate: fromDate ? new Date(fromDate) : undefined,
        forceRefresh,
      });

      return c.json(result);
    } catch (error) {
      logError('Failed to fetch athlete best performances', error, c);
      return c.json({ error: 'Failed to fetch athlete best performances' }, 500);
    }
  },
);

// DELETE /athletes/:license/performances/cache - Invalidate performance cache
athletesRoutes.delete(
  '/:license/performances/cache',
  zValidator(
    'param',
    z.object({
      license: Athlete$.shape.license,
    }),
  ),
  async c => {
    try {
      const { license } = c.req.valid('param');
      const success = await invalidatePerformanceCache(license);

      if (success) {
        return c.json({ message: 'Cache invalidated successfully' });
      }
      return c.json({ message: 'Cache not available or already empty' });
    } catch (error) {
      logError('Failed to invalidate performance cache', error, c);
      return c.json({ error: 'Failed to invalidate performance cache' }, 500);
    }
  },
);

// POST /athletes/:license/performances/prefetch - Prefetch performances for an athlete
athletesRoutes.post(
  '/:license/performances/prefetch',
  zValidator(
    'param',
    z.object({
      license: Athlete$.shape.license,
    }),
  ),
  async c => {
    try {
      const { license } = c.req.valid('param');

      await prefetchAthletePerformances(license);

      return c.json({ message: 'Performances prefetched successfully', license });
    } catch (error) {
      logError('Failed to prefetch athlete performances', error, c);
      return c.json({ error: 'Failed to prefetch athlete performances' }, 500);
    }
  },
);

export { athletesRoutes };

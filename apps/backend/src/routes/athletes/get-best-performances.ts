import { fetchAthleteBestPerformances } from '@/utils/performance-utils';
import { zValidator } from '@hono/zod-validator';
import { Athlete$, Date$ } from '@repo/utils';
import { Hono } from 'hono';
import { z } from 'zod';

// GET /athletes/:license/best-performances - Get best performances per event from Beathletics
export const getBestPerformancesRouter = new Hono().get(
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
    const { license } = c.req.valid('param');
    const { fromDate, forceRefresh } = c.req.valid('query');

    const result = await fetchAthleteBestPerformances(
      license,
      {
        fromDate: fromDate ? new Date(fromDate) : undefined,
        forceRefresh,
      },
      c.get('logStep'),
    );

    return c.json(result);
  },
);

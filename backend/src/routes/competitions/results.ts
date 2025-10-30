import { prisma } from '@/lib/prisma';
import { zValidator } from '@hono/zod-validator';
import { Cuid$, Result$, resultInclude } from '@repo/core/schemas';
import { Hono } from 'hono';
import z from 'zod';

export const competitionResultsRoutes = new Hono();

// GET /competitions/:eid/results - Get all results for a competition
competitionResultsRoutes.get(
  '/:eid/results',
  zValidator('param', z.object({ eid: Cuid$ })),
  async c => {
    const { eid } = c.req.param();

    // First check if competition exists and is published
    const competition = await prisma.competition.findFirst({
      where: { eid, isPublished: true },
      select: { id: true },
    });

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    const results = await prisma.result.findMany({
      where: { competitionId: competition.id },
      include: resultInclude,
    });

    return c.json(Result$.array().parse(results));
  },
);

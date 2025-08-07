import { prisma } from '@/lib/prisma';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  Cuid$,
  InscriptionPublic$,
  inscriptionInclude,
} from '@repo/core/schemas';
import { Hono } from 'hono';
import { z } from 'zod/v4';

const competitionInscriptionsRoutes = new Hono();

// GET /competitions/:eid/inscriptions - Get public inscriptions for a competition
competitionInscriptionsRoutes.get(
  '/:eid/inscriptions',
  zValidator('param', z.object({ eid: Cuid$ })),
  async (c) => {
    try {
      const { eid } = c.req.valid('param');

      // First check if competition exists and is published
      const competition = await prisma.competition.findFirst({
        where: { eid, isPublished: true },
        select: { id: true },
      });

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      // Get all non-deleted inscriptions for this competition
      const inscriptions = await prisma.inscription.findMany({
        where: {
          competitionId: competition.id,
          isDeleted: false,
        },
        include: inscriptionInclude,
        orderBy: [
          { inscriptionDate: 'desc' },
        ],
      });

      return c.json(InscriptionPublic$.array().parse(inscriptions));
    } catch (error) {
      logError('Failed to fetch competition inscriptions', error, c);
      return c.json({ error: 'Failed to fetch competition inscriptions' }, 500);
    }
  }
);

export { competitionInscriptionsRoutes };

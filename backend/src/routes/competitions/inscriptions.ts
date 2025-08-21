import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/utils/auth-utils';
import {
  calculateAlreadyPaidAmount,
  calculateTotalEventCost,
  upsertInscriptionsInDB,
  validateInscriptions,
} from '@/utils/inscription-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  Cuid$,
  InscriptionPublic$,
  inscriptionInclude,
  UpsertInscriptions$,
  competitionInclude,
  Competition$,
  InscriptionStatus$,
} from '@repo/core/schemas';
import { Hono } from 'hono';
import { z } from 'zod';

const competitionInscriptionsRoutes = new Hono();

// GET /competitions/:eid/inscriptions - Get public inscriptions for a competition
competitionInscriptionsRoutes.get(
  '/:eid/inscriptions',
  zValidator('param', z.object({ eid: Cuid$ })),
  async c => {
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
          status: {
            not: InscriptionStatus$.enum.CANCELLED,
          },
        },
        include: inscriptionInclude,
        orderBy: [{ inscriptionDate: 'desc' }],
      });

      return c.json(InscriptionPublic$.array().parse(inscriptions));
    } catch (error) {
      logError('Failed to fetch competition inscriptions', error, c);
      return c.json({ error: 'Failed to fetch competition inscriptions' }, 500);
    }
  },
);

// POST /competitions/:eid/inscriptions - Create inscriptions for a competition
competitionInscriptionsRoutes.post(
  '/:eid/inscriptions',
  zValidator('param', z.object({ eid: Cuid$ })),
  zValidator('json', UpsertInscriptions$),
  async c => {
    try {
      const session = await getRequiredSession(c);
      const { eid } = c.req.valid('param');
      const inscriptions = c.req.valid('json');

      // Get competition
      const competition = Competition$.parse(
        await prisma.competition.findFirst({
          where: { eid, isPublished: true },
          include: competitionInclude,
        }),
      );

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      await validateInscriptions(competition, inscriptions, session.userId);

      const alreadyPaid = await calculateAlreadyPaidAmount(
        competition,
        inscriptions,
        session.userId,
      );

      const totalEventCost = calculateTotalEventCost(competition, inscriptions);

      if (totalEventCost > alreadyPaid) {
        return c.json({ error: 'Additional payment required for these inscriptions' }, 400);
      }

      await upsertInscriptionsInDB(competition, inscriptions, session.userId, alreadyPaid);

      return c.json({ success: true }, 200);
    } catch (error) {
      logError('Failed to create inscriptions', error, c);
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Failed to create inscriptions',
        },
        400,
      );
    }
  },
);

export { competitionInscriptionsRoutes };

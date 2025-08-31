import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { getRequiredSession } from '@/utils/auth-utils';
import { upsertInscriptionsInDB } from '@/utils/inscription-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  Competition$,
  competitionInclude,
  Cuid$,
  Id,
  Inscription$,
  inscriptionInclude,
  InscriptionStatus$,
  ParameterId$,
  UpsertInscriptions,
  UpsertInscriptions$,
} from '@repo/core/schemas';
import { logger } from 'better-auth';
import { Hono } from 'hono';
import { z } from 'zod';

const organizationInscriptionsRoutes = new Hono();

// GET /organization/competitions/:eid/inscriptions - Get all inscriptions for a competition (admin)
organizationInscriptionsRoutes.get(
  '/:eid/inscriptions',
  requirePermissions({
    inscriptions: ['read'],
  }),
  zValidator('param', z.object({ eid: Cuid$ })),
  async c => {
    try {
      const { eid } = c.req.valid('param');
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', { session });
        return c.json({ error: 'No active organization found' }, 400);
      }

      // Check if competition belongs to the organization
      const competition = await prisma.competition.findFirst({
        where: {
          eid,
          organizationId: session.activeOrganizationId,
        },
        select: { id: true },
      });

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      // Get all inscriptions for this competition (including deleted ones for admin view)
      const inscriptions = await prisma.inscription.findMany({
        where: {
          competitionId: competition.id,
        },
        include: inscriptionInclude,
        orderBy: [{ inscriptionDate: 'desc' }],
      });

      return c.json(Inscription$.array().parse(inscriptions));
    } catch (error) {
      logError('Failed to fetch organization competition inscriptions', error, c);
      return c.json({ error: 'Failed to fetch competition inscriptions' }, 500);
    }
  },
);

// POST /organization/competitions/:eid/inscriptions - Create inscriptions without payment (admin/org)
organizationInscriptionsRoutes.post(
  '/:eid/inscriptions',
  requirePermissions({
    inscriptions: ['manage'],
  }),
  zValidator('param', z.object({ eid: Cuid$ })),
  zValidator('json', UpsertInscriptions$),
  async c => {
    try {
      const session = await getRequiredSession(c);
      const { eid } = c.req.valid('param');
      const inscriptions = c.req.valid('json');

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', { session });
        return c.json({ error: 'No active organization found' }, 400);
      }

      // Check if competition belongs to the organization
      const competition = Competition$.parse(
        await prisma.competition.findFirst({
          where: {
            eid,
            organizationId: session.activeOrganizationId,
          },
          include: competitionInclude,
        }),
      );

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      // Group inscriptions by athleteId
      const groupedInscriptions = inscriptions.reduce(
        (acc, inscription) => {
          const athleteId = inscription.athleteId;
          if (!acc[athleteId]) {
            acc[athleteId] = [];
          }
          acc[athleteId].push(inscription);
          return acc;
        },
        {} as Record<Id, UpsertInscriptions>,
      );

      // for each athlete, create or update their inscriptions
      for (const athleteId of Object.keys(groupedInscriptions).map(athleteId =>
        ParameterId$.parse(athleteId),
      )) {
        const athleteInscriptions = groupedInscriptions[athleteId];

        const existingInscription = await prisma.inscription.findFirst({
          where: {
            athleteId: athleteId,
            competitionId: competition.id,
          },
          select: { userId: true },
        });

        const userId = existingInscription?.userId || session.userId;

        await upsertInscriptionsInDB(
          competition,
          athleteInscriptions,
          userId,
          InscriptionStatus$.enum.REGISTERED,
        );
      }

      return c.json({ success: true }, 200);
    } catch (error) {
      logError('Failed to create organization inscriptions', error, c);
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Failed to create inscriptions',
        },
        400,
      );
    }
  },
);

export { organizationInscriptionsRoutes };

import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { getRequiredSession } from '@/utils/auth-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import { Cuid$, Inscription$, inscriptionInclude } from '@repo/core/schemas';
import { logger } from 'better-auth';
import { Hono } from 'hono';
import { z } from 'zod/v4';

const organizationInscriptionsRoutes = new Hono();

// GET /organization/competitions/:eid/inscriptions - Get all inscriptions for a competition (admin)
organizationInscriptionsRoutes.get(
  '/:eid/inscriptions',
  requirePermissions({
    competitions: ['read'],
  }),
  zValidator('param', z.object({ eid: Cuid$ })),
  async (c) => {
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
        orderBy: [
          { inscriptionDate: 'desc' },
        ],
      });

      return c.json(Inscription$.array().parse(inscriptions));
    } catch (error) {
      logError(
        'Failed to fetch organization competition inscriptions',
        error,
        c
      );
      return c.json({ error: 'Failed to fetch competition inscriptions' }, 500);
    }
  }
);

export { organizationInscriptionsRoutes };

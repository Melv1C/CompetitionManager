import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { getRequiredSession } from '@/utils/auth-utils';
import { getCompetitions } from '@/utils/competition-utils';
import { logError } from '@/utils/log-utils';
import {
  Competition$,
  CompetitionCreate$,
  CompetitionPrismaCreate$,
  competitionInclude,
} from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { logger } from 'better-auth';
import { Hono } from 'hono';

const organizationCompetitionsRoutes = new Hono();

// GET /organization/competitions - Get competitions for the active organization
organizationCompetitionsRoutes.get(
  '/',
  requirePermissions({
    competitions: ['read'],
  }),
  async (c) => {
    try {
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', {
          session,
        });
        return c.json({ error: 'No active organization found' }, 400);
      }

      const competitions = await getCompetitions({
        where: {
          organizationId: session.activeOrganizationId,
        },
        orderBy: { startDate: 'desc' },
      });

      return c.json(competitions);
    } catch (error) {
      logError('Failed to fetch organization competitions', error, c);
      return c.json(
        { error: 'Failed to fetch organization competitions' },
        500
      );
    }
  }
);

// POST /organization/competitions - Create new competition
organizationCompetitionsRoutes.post(
  '/',
  requirePermissions({
    competitions: ['create'],
  }),
  zValidator('json', CompetitionCreate$),
  async (c) => {
    try {
      const { name, startDate } = c.req.valid('json');
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', {
          session,
        });
        return c.json({ error: 'No active organization found' }, 400);
      }
      const data = CompetitionPrismaCreate$.parse({
        name,
        startDate: new Date(startDate),
        organizationId: session.activeOrganizationId,
        createdBy: session.userId,
        updatedBy: session.userId,
      });

      const competition = await prisma.competition.create({
        data,
        include: competitionInclude,
      });

      return c.json(Competition$.parse(competition), 201);
    } catch (error) {
      logError('Failed to create competition', error, c);
      return c.json({ error: 'Failed to create competition' }, 500);
    }
  }
);

export { organizationCompetitionsRoutes };

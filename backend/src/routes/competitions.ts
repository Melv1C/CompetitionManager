import { prisma, type Prisma } from '@/lib/prisma';
import { requireOrganizationPermissions } from '@/middleware/access-control';
import { requireAuth } from '@/middleware/auth';
import { getRequiredSession, getRequiredUser } from '@/utils/auth-utils';
import { logError } from '@/utils/log-utils';
import {
  Competition$,
  CompetitionCreate$,
  competitionInclude,
  CompetitionPrismaCreate$,
  CompetitionQuery$,
} from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { logger } from 'better-auth';
import { Hono } from 'hono';

const competitionsRoutes = new Hono();

// GET /competitions - Get competitions with optional filters (public)
competitionsRoutes.get(
  '/',
  zValidator('query', CompetitionQuery$),
  async (c) => {
    try {
      const { upcoming, past, organizationId } = c.req.valid('query');
      const where: Prisma.CompetitionWhereInput = {};
      const now = new Date();

      if (upcoming && !past) {
        where.startDate = { gte: now };
      } else if (past && !upcoming) {
        where.startDate = { lt: now };
      }

      if (organizationId) {
        where.organizationId = organizationId;
      }

      const competitions = await prisma.competition.findMany({
        where,
        orderBy: { startDate: 'asc' },
        include: competitionInclude,
      });

      return c.json(Competition$.array().parse(competitions));
    } catch (error) {
      logError('Failed to fetch competitions', error, c);
      return c.json({ error: 'Failed to fetch competitions' }, 500);
    }
  }
);

// POST /competitions - Create new competition
competitionsRoutes.post(
  '/',
  requireAuth,
  requireOrganizationPermissions({
    competitions: ['create'],
  }),
  zValidator('json', CompetitionCreate$),
  async (c) => {
    try {
      const { name, startDate } = c.req.valid('json');
      const user = await getRequiredUser(c);
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', {
          user,
          session,
        });
        return c.json({ error: 'No active organization found' }, 400);
      }
      const data = CompetitionPrismaCreate$.parse({
        name,
        startDate: new Date(startDate),
        organizationId: session.activeOrganizationId,
        createdBy: user.id,
        updatedBy: user.id,
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

export { competitionsRoutes };

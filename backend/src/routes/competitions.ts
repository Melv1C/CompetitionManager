import { type Prisma } from '@/lib/prisma';
import { getCompetitions } from '@/utils/competition-utils';
import { logError } from '@/utils/log-utils';
import { CompetitionQuery$ } from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

const competitionsRoutes = new Hono();

// GET /competitions - Get competitions with optional filters (public)
competitionsRoutes.get(
  '/',
  zValidator('query', CompetitionQuery$),
  async (c) => {
    try {
      const { upcoming, past, organizationId } = c.req.valid('query');
      const where: Prisma.CompetitionWhereInput = {
        isPublished: true,
      };
      const now = new Date();

      if (upcoming && !past) {
        where.startDate = { gte: now };
      } else if (past && !upcoming) {
        where.startDate = { lt: now };
      }

      if (organizationId) {
        where.organizationId = organizationId;
      }
      const competitions = await getCompetitions({
        where,
        orderBy: { startDate: 'asc' },
      });

      return c.json(competitions);
    } catch (error) {
      logError('Failed to fetch competitions', error, c);
      return c.json({ error: 'Failed to fetch competitions' }, 500);
    }
  }
);

export { competitionsRoutes };

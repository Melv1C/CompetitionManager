import { prisma, type Prisma } from '@/lib/prisma';
import { getCompetitions } from '@/utils/competition-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import { Competition$, competitionInclude, CompetitionQuery$, Cuid$ } from '@repo/core/schemas';
import { Hono } from 'hono';
import { z } from 'zod';
import { competitionInscriptionsRoutes } from './inscriptions';
import { competitionResultsRoutes } from './results';

const competitionsRoutes = new Hono();

// Mount inscription routes
competitionsRoutes.route('/', competitionInscriptionsRoutes);
competitionsRoutes.route('/', competitionResultsRoutes);

// GET /competitions - Get competitions with optional filters (public)
competitionsRoutes.get('/', zValidator('query', CompetitionQuery$), async c => {
  try {
    const { upcoming, past, organizationId } = c.req.valid('query');
    const where: Prisma.CompetitionWhereInput = {
      isPublished: true,
    };
    const now = new Date();

    if (upcoming && !past) {
      // Upcoming: competition hasn't ended yet (endDate >= today)
      where.endDate = { gte: now };
    } else if (past && !upcoming) {
      // Past: competition has started in the past (startDate < today)
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
});

// GET /competitions/:eid - Get single competition details (public)
competitionsRoutes.get('/:eid', zValidator('param', z.object({ eid: Cuid$ })), async c => {
  try {
    const { eid } = c.req.valid('param');
    const competition = await prisma.competition.findFirst({
      where: { eid, isPublished: true },
      include: competitionInclude,
    });

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    return c.json(Competition$.parse(competition));
  } catch (error) {
    logError('Failed to fetch competition', error, c);
    return c.json({ error: 'Failed to fetch competition' }, 500);
  }
});

export { competitionsRoutes };

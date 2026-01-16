import { getCompetitions } from '@/utils/competition-utils';
import { zValidator } from '@hono/zod-validator';
import { prisma, type Prisma } from '@repo/database';
import { Competition$, CompetitionQuery$, Cuid$, competitionInclude } from '@repo/utils';
import { Hono } from 'hono';
import { z } from 'zod';
import { competitionInscriptionsRoutes } from './inscriptions';
import { competitionResultsRoutes } from './results';

export const competitionsRoutes = new Hono()

  // Mount inscription routes
  .route('/', competitionInscriptionsRoutes)
  .route('/', competitionResultsRoutes)

  // GET /competitions - Get competitions with optional filters (public)
  .get('/', zValidator('query', CompetitionQuery$), async c => {
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
  })

  // GET /competitions/:eid - Get single competition details (public)
  .get('/:eid', zValidator('param', z.object({ eid: Cuid$ })), async c => {
    const { eid } = c.req.valid('param');
    const competition = await prisma.competition.findFirst({
      where: { eid, isPublished: true },
      include: competitionInclude,
    });

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    return c.json(Competition$.parse(competition));
  });

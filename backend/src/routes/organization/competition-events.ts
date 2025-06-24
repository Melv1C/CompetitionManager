import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { getRequiredSession } from '@/utils/auth-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  CompetitionEvent$,
  CompetitionEventCreate$,
  CompetitionEventUpdate$,
  CompetitionEventPrismaCreate$,
  Cuid$,
  competitionEventInclude,
} from '@repo/core/schemas';
import { logger } from 'better-auth';
import { Hono } from 'hono';
import { z } from 'zod/v4';

const organizationCompetitionEventsRoutes = new Hono();

// POST /organization/competitions/:eid/events - Create competition event
organizationCompetitionEventsRoutes.post(
  '/:eid/events',
  requirePermissions({
    events: ['create'],
  }),
  zValidator('param', z.object({ eid: Cuid$ })),
  zValidator('json', CompetitionEventCreate$),
  async (c) => {
    try {
      const { eid } = c.req.valid('param');
      const { categoryIds, ...eventBody } = c.req.valid('json');
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', { session });
        return c.json({ error: 'No active organization found' }, 400);
      }

      const competition = await prisma.competition.findFirst({
        where: { eid, organizationId: session.activeOrganizationId },
      });

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      const data = CompetitionEventPrismaCreate$.parse({
        ...eventBody,
        competitionId: competition.id,
        createdBy: session.userId,
        updatedBy: session.userId,
      });

      const competitionEvent = await prisma.competitionEvent.create({
        data: {
          ...data,
          categories: categoryIds
            ? { connect: categoryIds.map((id) => ({ id })) }
            : undefined,
        },
        include: competitionEventInclude,
      });

      return c.json(CompetitionEvent$.parse(competitionEvent), 201);
    } catch (error) {
      logError('Failed to create competition event', error, c);
      return c.json({ error: 'Failed to create competition event' }, 500);
    }
  }
);

// PUT /organization/competitions/:competitionEid/events/:eventEid - Update competition event
organizationCompetitionEventsRoutes.put(
  '/:competitionEid/events/:eventEid',
  requirePermissions({
    events: ['update'],
  }),
  zValidator(
    'param',
    z.object({ competitionEid: Cuid$, eventEid: Cuid$ })
  ),
  zValidator('json', CompetitionEventUpdate$),
  async (c) => {
    try {
      const { competitionEid, eventEid } = c.req.valid('param');
      const { categoryIds, ...updateBody } = c.req.valid('json');
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', { session });
        return c.json({ error: 'No active organization found' }, 400);
      }

      const competition = await prisma.competition.findFirst({
        where: { eid: competitionEid, organizationId: session.activeOrganizationId },
      });

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      const competitionEvent = await prisma.competitionEvent.findFirst({
        where: { eid: eventEid, competitionId: competition.id },
      });

      if (!competitionEvent) {
        return c.json({ error: 'Competition event not found' }, 404);
      }

      const data: Record<string, unknown> = {
        ...updateBody,
        updatedBy: session.userId,
      };

      if (categoryIds) {
        data.categories = { set: categoryIds.map((id) => ({ id })) };
      }

      const updatedCompetitionEvent = await prisma.competitionEvent.update({
        where: { id: competitionEvent.id },
        data,
        include: competitionEventInclude,
      });

      return c.json(CompetitionEvent$.parse(updatedCompetitionEvent));
    } catch (error) {
      logError('Failed to update competition event', error, c);
      return c.json({ error: 'Failed to update competition event' }, 500);
    }
  }
);

export { organizationCompetitionEventsRoutes };

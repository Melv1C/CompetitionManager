import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { getRequiredSession } from '@/utils/auth-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  CompetitionEvent$,
  CompetitionEventCreate$,
  CompetitionEventPrisma$,
  CompetitionEventUpdate$,
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
      const { categoryIds, subEvents, ...eventBody } = c.req.valid('json');
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

      const data = CompetitionEventPrisma$.parse({
        ...eventBody,
        competitionId: competition.id,
        createdBy: session.userId,
        updatedBy: session.userId,
      });

      const competitionEvent = await prisma.competitionEvent.create({
        data: {
          ...data,
          categories: { connect: categoryIds.map((id) => ({ id })) },
        },
        include: competitionEventInclude,
      });

      if (subEvents && subEvents.length > 0) {
        await prisma.competitionEvent.createMany({
          data: subEvents.map((subEvent) => ({
            ...CompetitionEventPrisma$.parse({
              ...subEvent,
              price: 0, // Assuming sub-events have no price
              maxParticipants: eventBody.maxParticipants,
              parentId: competitionEvent.id,
              competitionId: competition.id,
              createdBy: session.userId,
              updatedBy: session.userId,
            }),
          })),
        });
      }

      return c.json(CompetitionEvent$.parse(competitionEvent), 201);
    } catch (error) {
      logError('Failed to create competition event', error, c);
      return c.json({ error: 'Failed to create competition event' }, 500);
    }
  }
);

// PUT /organization/competitions/:eid/events/:eventId - Update competition event
organizationCompetitionEventsRoutes.put(
  '/:eid/events/:eventEid',
  requirePermissions({
    events: ['update'],
  }),
  zValidator('param', z.object({ eid: Cuid$, eventEid: Cuid$ })),
  zValidator('json', CompetitionEventUpdate$),
  async (c) => {
    try {
      const { eid, eventEid } = c.req.valid('param');
      const { categoryIds, subEvents, ...eventBody } = c.req.valid('json');

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

      const competitionEvent = await prisma.competitionEvent.findFirst({
        where: { eid: eventEid },
        include: competitionEventInclude,
      });
      if (!competitionEvent) {
        return c.json({ error: 'Competition event not found' }, 404);
      }

      const data = CompetitionEventPrisma$.partial().parse({
        ...eventBody,
        updatedBy: session.userId,
      });

      const updatedEvent = await prisma.competitionEvent.update({
        where: { eid: eventEid },
        data: {
          ...data,
          categories: { set: categoryIds.map((id) => ({ id })) },
        },
        include: competitionEventInclude,
      });

      // subEvents has and id (subEvent.id) if it's an update, otherwise it's a new sub-event
      if (subEvents && subEvents.length > 0) {
        const subEventUpdates = subEvents.map((subEvent) => {
          const subEventData = CompetitionEventPrisma$.parse({
            ...subEvent,
            price: 0, // Assuming sub-events have no price
            maxParticipants: eventBody.maxParticipants,
            parentId: updatedEvent.id,
            competitionId: competition.id,
            updatedBy: session.userId,
          });

          if (subEvent.id) {
            return prisma.competitionEvent.update({
              where: { id: subEvent.id },
              data: subEventData,
            });
          } else {
            return prisma.competitionEvent.create({
              data: subEventData,
            });
          }
        });
        await Promise.all(subEventUpdates);
      }

      return c.json(CompetitionEvent$.parse(updatedEvent), 200);
    } catch (error) {
      logError('Failed to update competition event', error, c);
      return c.json({ error: 'Failed to update competition event' }, 500);
    }
  }
);

// DELETE /organization/competitions/:eid/events/:eventEid - Delete competition event
organizationCompetitionEventsRoutes.delete(
  '/:eid/events/:eventEid',
  requirePermissions({
    events: ['delete'],
  }),
  zValidator('param', z.object({ eid: Cuid$, eventEid: Cuid$ })),
  async (c) => {
    try {
      const { eid, eventEid } = c.req.valid('param');

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

      const competitionEvent = await prisma.competitionEvent.findFirst({
        where: { eid: eventEid },
      });
      if (!competitionEvent) {
        return c.json({ error: 'Competition event not found' }, 404);
      }

      await prisma.competitionEvent.delete({
        where: { eid: eventEid },
      });

      return c.json({ message: 'Competition event deleted successfully' }, 200);
    } catch (error) {
      logError('Failed to delete competition event', error, c);
      return c.json({ error: 'Failed to delete competition event' }, 500);
    }
  }
);

export { organizationCompetitionEventsRoutes };

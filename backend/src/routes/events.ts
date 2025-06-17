import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/auth';
import { logError } from '@/utils/log-utils';
import {
  Event$,
  EventCreate$,
  EventUpdate$,
} from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod/v4';

const eventsRoutes = new Hono();

// GET /events - Get all events (public)
eventsRoutes.get('/', async (c) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { name: 'asc' },
    });
    return c.json(Event$.array().parse(events));
  } catch (error) {
    logError('Failed to fetch events', error, c);
    return c.json({ error: 'Failed to fetch events' }, 500);
  }
});

// GET /events/:id - Get event by ID (public)
eventsRoutes.get(
  '/:id',
  zValidator('param', z.object({ id: Event$.shape.id })),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        return c.json({ error: 'Event not found' }, 404);
      }

      return c.json(Event$.parse(event));
    } catch (error) {
      logError('Failed to fetch event', error, c);
      return c.json({ error: 'Failed to fetch event' }, 500);
    }
  }
);

// POST /events - Create new event (admin only)
eventsRoutes.post(
  '/',
  requireAdmin,
  zValidator('json', EventCreate$),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const event = await prisma.event.create({
        data,
      });
      return c.json(Event$.parse(event), 201);
    } catch (error) {
      logError('Failed to create event', error, c);
      return c.json({ error: 'Failed to create event' }, 500);
    }
  }
);

// PUT /events/:id - Update event (admin only)
eventsRoutes.put(
  '/:id',
  requireAdmin,
  zValidator('param', z.object({ id: Event$.shape.id })),
  zValidator('json', EventUpdate$),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');

      // Check if event exists
      const existingEvent = await prisma.event.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        return c.json({ error: 'Event not found' }, 404);
      }

      const event = await prisma.event.update({
        where: { id },
        data,
      });

      return c.json(Event$.parse(event));
    } catch (error) {
      logError('Failed to update event', error, c);
      return c.json({ error: 'Failed to update event' }, 500);
    }
  }
);

// DELETE /events/:id - Delete event (admin only)
eventsRoutes.delete(
  '/:id',
  requireAdmin,
  zValidator('param', z.object({ id: Event$.shape.id })),
  async (c) => {
    try {
      const { id } = c.req.valid('param');

      // Check if event exists
      const existingEvent = await prisma.event.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        return c.json({ error: 'Event not found' }, 404);
      }

      // Check if event has related competition events
      const competitionEventsCount = await prisma.competitionEvent.count({
        where: { eventId: id },
      });

      if (competitionEventsCount > 0) {
        return c.json(
          {
            error: 'Cannot delete event with associated competition events',
          },
          400
        );
      }

      await prisma.event.delete({
        where: { id },
      });

      return c.json({ message: 'Event deleted successfully' });
    } catch (error) {
      logError('Failed to delete event', error, c);
      return c.json({ error: 'Failed to delete event' }, 500);
    }
  }
);

export { eventsRoutes };

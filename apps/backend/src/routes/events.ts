import { zValidator } from '@hono/zod-validator';
import { prisma } from '@repo/database';
import { Event$, ParameterId$ } from '@repo/utils';
import { Hono } from 'hono';
import { z } from 'zod';

export const eventsRoutes = new Hono()

  // GET /events - Get all events (public)
  .get('/', async c => {
    const events = await prisma.event.findMany({
      orderBy: { name: 'asc' },
    });
    return c.json(Event$.array().parse(events));
  })

  // GET /events/:id - Get event by ID (public)
  .get('/:id', zValidator('param', z.object({ id: ParameterId$ })), async c => {
    const { id } = c.req.valid('param');
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    return c.json(Event$.parse(event));
  });

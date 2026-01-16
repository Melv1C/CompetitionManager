import { zValidator } from '@hono/zod-validator';
import { prisma } from '@repo/database';
import { Club$, ParameterId$ } from '@repo/utils';
import { Hono } from 'hono';
import { z } from 'zod';

export const clubsRoutes = new Hono()

  // GET /clubs - Get all clubs (public)
  .get('/', async c => {
    const clubs = await prisma.club.findMany({
      orderBy: { abbr: 'asc' },
    });
    return c.json(Club$.array().parse(clubs));
  })

  // GET /clubs/:id - Get club by ID (public)
  .get('/:id', zValidator('param', z.object({ id: ParameterId$ })), async c => {
    const { id } = c.req.valid('param');
    const club = await prisma.club.findUnique({
      where: { id },
    });
    if (!club) {
      return c.json({ error: 'Club not found' }, 404);
    }
    return c.json(Club$.parse(club));
  });

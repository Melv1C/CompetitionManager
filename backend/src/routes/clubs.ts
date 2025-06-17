import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/auth';
import { logError } from '@/utils/log-utils';
import { Club$, ClubCreate$, ClubUpdate$ } from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod/v4';

const clubsRoutes = new Hono();

// GET /clubs - Get all clubs (public)
clubsRoutes.get('/', async (c) => {
  try {
    const clubs = await prisma.club.findMany({
      orderBy: { abbr: 'asc' },
    });
    return c.json(Club$.array().parse(clubs));
  } catch (error) {
    logError('Failed to fetch clubs', error, c);
    return c.json({ error: 'Failed to fetch clubs' }, 500);
  }
});

// GET /clubs/:id - Get club by ID (public)
clubsRoutes.get(
  '/:id',
  zValidator('param', z.object({ id: Club$.shape.id })),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const club = await prisma.club.findUnique({
        where: { id },
      });
      if (!club) {
        return c.json({ error: 'Club not found' }, 404);
      }
      return c.json(Club$.parse(club));
    } catch (error) {
      logError('Failed to fetch club', error, c);
      return c.json({ error: 'Failed to fetch club' }, 500);
    }
  }
);

// POST /clubs - Create new club (admin only)
clubsRoutes.post(
  '/',
  requireAdmin,
  zValidator('json', ClubCreate$),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const club = await prisma.club.create({ data });
      return c.json(Club$.parse(club), 201);
    } catch (error) {
      logError('Failed to create club', error, c);
      return c.json({ error: 'Failed to create club' }, 500);
    }
  }
);

// PUT /clubs/:id - Update club (admin only)
clubsRoutes.put(
  '/:id',
  requireAdmin,
  zValidator('param', z.object({ id: Club$.shape.id })),
  zValidator('json', ClubUpdate$),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');

      const existingClub = await prisma.club.findUnique({ where: { id } });
      if (!existingClub) {
        return c.json({ error: 'Club not found' }, 404);
      }

      const club = await prisma.club.update({ where: { id }, data });
      return c.json(Club$.parse(club));
    } catch (error) {
      logError('Failed to update club', error, c);
      return c.json({ error: 'Failed to update club' }, 500);
    }
  }
);

// DELETE /clubs/:id - Delete club (admin only)
clubsRoutes.delete(
  '/:id',
  requireAdmin,
  zValidator('param', z.object({ id: Club$.shape.id })),
  async (c) => {
    try {
      const { id } = c.req.valid('param');

      const existingClub = await prisma.club.findUnique({ where: { id } });
      if (!existingClub) {
        return c.json({ error: 'Club not found' }, 404);
      }

      const dependencies = await prisma.$transaction([
        prisma.athleteInfo.count({ where: { clubId: id } }),
        prisma.competition.count({ where: { clubs: { some: { id } } } }),
        prisma.competition.count({ where: { freeClubs: { some: { id } } } }),
        prisma.competition.count({ where: { allowedClubs: { some: { id } } } }),
      ]);

      if (dependencies.some((count) => count > 0)) {
        return c.json(
          { error: 'Cannot delete club with associated records' },
          400
        );
      }

      await prisma.club.delete({ where: { id } });
      return c.json({ message: 'Club deleted successfully' });
    } catch (error) {
      logError('Failed to delete club', error, c);
      return c.json({ error: 'Failed to delete club' }, 500);
    }
  }
);

export { clubsRoutes };

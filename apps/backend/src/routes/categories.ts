import { zValidator } from '@hono/zod-validator';
import { prisma } from '@repo/database';
import { FullCategory$, ParameterId$ } from '@repo/utils';
import { Hono } from 'hono';
import { z } from 'zod';

export const categoriesRoutes = new Hono()

  // GET /categories - Get all categories (public)
  .get('/', async c => {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return c.json(FullCategory$.array().parse(categories));
  })

  // GET /categories/:id - Get category by ID (public)
  .get('/:id', zValidator('param', z.object({ id: ParameterId$ })), async c => {
    const { id } = c.req.valid('param');
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }

    return c.json(FullCategory$.parse(category));
  });

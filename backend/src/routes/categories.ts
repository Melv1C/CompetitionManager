import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { requireAuth } from '@/middleware/auth';
import { logError } from '@/utils/log-utils';
import {
  Category$,
  CategoryCreate$,
  CategoryUpdate$,
} from '@competition-manager/core/schemas';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod/v4';

const categoriesRoutes = new Hono();

// GET /categories - Get all categories (public)
categoriesRoutes.get('/', async (c) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return c.json(Category$.array().parse(categories));
  } catch (error) {
    logError('Failed to fetch categories', error, c);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

// GET /categories/:id - Get category by ID (public)
categoriesRoutes.get(
  '/:id',
  zValidator('param', z.object({ id: Category$.shape.id })),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const category = await prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        return c.json({ error: 'Category not found' }, 404);
      }

      return c.json(Category$.parse(category));
    } catch (error) {
      logError('Failed to fetch category', error, c);
      return c.json({ error: 'Failed to fetch category' }, 500);
    }
  }
);

// POST /categories - Create new category (admin only)
categoriesRoutes.post(
  '/',
  requireAuth,
  requirePermissions({
    categories: ['create'],
  }),
  zValidator('json', CategoryCreate$),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const category = await prisma.category.create({
        data,
      });
      return c.json(Category$.parse(category), 201);
    } catch (error) {
      logError('Failed to create category', error, c);
      return c.json({ error: 'Failed to create category' }, 500);
    }
  }
);

// PUT /categories/:id - Update category (admin only)
categoriesRoutes.put(
  '/:id',
  requireAuth,
  requirePermissions({
    categories: ['update'],
  }),
  zValidator('param', z.object({ id: Category$.shape.id })),
  zValidator('json', CategoryUpdate$),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return c.json({ error: 'Category not found' }, 404);
      }

      const category = await prisma.category.update({
        where: { id },
        data,
      });

      return c.json(Category$.parse(category));
    } catch (error) {
      logError('Failed to update category', error, c);
      return c.json({ error: 'Failed to update category' }, 500);
    }
  }
);

// DELETE /categories/:id - Delete category (admin only)
categoriesRoutes.delete(
  '/:id',
  requireAuth,
  requirePermissions({
    categories: ['delete'],
  }),
  zValidator('param', z.object({ id: Category$.shape.id })),
  async (c) => {
    try {
      const { id } = c.req.valid('param');

      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        return c.json({ error: 'Category not found' }, 404);
      }

      // Check if category has related competition events
      const competitionEventsCount = await prisma.competitionEvent.count({
        where: {
          categories: {
            some: {
              id: id,
            },
          },
        },
      });

      if (competitionEventsCount > 0) {
        return c.json(
          {
            error: 'Cannot delete category with associated competition events',
          },
          400
        );
      }

      await prisma.category.delete({
        where: { id },
      });

      return c.json({ message: 'Category deleted successfully' });
    } catch (error) {
      logError('Failed to delete category', error, c);
      return c.json({ error: 'Failed to delete category' }, 500);
    }
  }
);

export { categoriesRoutes };

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/use-auth';
import { Hono } from 'hono';

export const studioRoutes = new Hono();

studioRoutes.post('/', requireAdmin, async c => {
  // 1. Extract the query and custom data from the request
  const { query } = await c.req.json();

  // Run the query against Prisma Client
  const results = await prisma.$queryRawUnsafe(query.sql, ...query.parameters);

  return c.json([null, results]);
});

import { isAdmin } from '@/middlewares/use-auth';
import { prisma, type Prisma } from '@repo/database';
import { LogFilter$, LogWithUser$, PaginatedLogs$ } from '@repo/utils';
import { Hono } from 'hono';

export const logsRoutes = new Hono()
  .get('/', isAdmin, async c => {
    const query = c.req.query();
    const filter = LogFilter$.parse(query);

    const where: Prisma.LogWhereInput = {};

    if (filter.types && filter.types.length > 0) {
      where.type = { in: filter.types };
    }

    if (filter.levels && filter.levels.length > 0) {
      where.level = { in: filter.levels };
    }

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) where.createdAt.gte = filter.startDate;
      if (filter.endDate) where.createdAt.lte = filter.endDate;
    }

    if (filter.search) {
      const searchTerm = filter.search;
      where.OR = [
        { message: { contains: searchTerm, mode: 'insensitive' } },
        { path: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
      prisma.log.count({ where }),
    ]);

    const result = PaginatedLogs$.parse({
      data: logs,
      pagination: {
        page: filter.page,
        pageSize: filter.pageSize,
        total,
        totalPages: Math.ceil(total / filter.pageSize),
      },
    });

    return c.json(result);
  })
  .get('/:id', isAdmin, async c => {
    const id = parseInt(c.req.param('id'), 10);
    const log = await prisma.log.findUnique({ where: { id } });
    if (!log) {
      return c.json({ error: 'Log not found' }, 404);
    }

    // Fetch user if userId exists
    let user = null;
    if (log.userId) {
      user = await prisma.user.findUnique({
        where: { id: log.userId },
        select: { id: true, name: true, email: true, image: true },
      });
    }

    return c.json(LogWithUser$.parse({ ...log, user }));
  });

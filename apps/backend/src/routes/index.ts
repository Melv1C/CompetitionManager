import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { prisma } from '@repo/database';
import { requestLogger } from '@repo/logger';
import { Hono } from 'hono';

import { useAuth } from '@/middleware/use-auth';
import { athletesRoutes } from './athletes';
import { categoriesRoutes } from './categories';
import { clubsRoutes } from './clubs';
import { competitionsRoutes } from './competitions';
import { cronRoutes } from './cron';
import { eventsRoutes } from './events';
import { healthRoutes } from './health';
import { usersRoutes } from './users';
import { logsRoutes } from './logs';

export const routes = new Hono()
  .use(useAuth)

  .route('/health', healthRoutes)
  .route('/logs', logsRoutes)
  .post('/studio', async c => {
    const { query } = await c.req.json();
    const results = await prisma.$queryRawUnsafe(query.sql, ...query.parameters);
    return c.json([null, results]);
  })
  .on(['POST', 'GET'], '/auth/*', c => auth.handler(c.req.raw))
  //////////////////////////////////////////////////
  // Add routes without logging middleware here
  //////////////////////////////////////////////////
  .use('*', requestLogger(logger))
  //////////////////////////////////////////////////
  // Add routes with logging middleware applied here
  .route('/athletes', athletesRoutes)
  .route('/competitions', competitionsRoutes)
  .route('/cron', cronRoutes)
  .route('/users', usersRoutes)
  .route('/categories', categoriesRoutes)
  .route('/clubs', clubsRoutes)
  .route('/events', eventsRoutes)
  //////////////////////////////////////////////////
  // Global error handler
  .onError((err, c) => {
    if (c.get('logStep')) {
      c.get('logStep').error('Unhandled error occurred in route', { error: err.message });
    } else {
      logger.error('Unhandled error occurred but logStep is missing', {
        metadata: { error: err.message },
      });
    }
    return c.json({ message: 'Internal Server Error' }, 500);
  });

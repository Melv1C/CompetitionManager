import { loggerMiddleware } from '@/middleware/logger';
import { Hono } from 'hono';
import { athletesRoutes } from './athletes';
import { authRoutes } from './auth';
import { categoriesRoutes } from './categories';
import { clubsRoutes } from './clubs';
import { competitionsRoutes } from './competitions';
import { eventsRoutes } from './events';
import { logsRoutes } from './logs';
import { organizationRoutes } from './organization';
import { studioRoutes } from './studio';
import { usersRoutes } from './users';
import { webhooksRoutes } from './webhooks';

export function createApiRoutes() {
  const api = new Hono();

  api.get('/health', c => {
    return c.json({ status: 'ok' });
  });

  api.route('/logs', logsRoutes);
  api.route('/studio', studioRoutes);

  // Global logging middleware for all API routes
  api.use('/*', loggerMiddleware);

  api.route('/athletes', athletesRoutes);
  api.route('/auth', authRoutes);
  api.route('/events', eventsRoutes);
  api.route('/categories', categoriesRoutes);
  api.route('/clubs', clubsRoutes);
  api.route('/competitions', competitionsRoutes);
  api.route('/organization', organizationRoutes);
  api.route('/users', usersRoutes);
  api.route('/webhooks', webhooksRoutes);

  return api;
}

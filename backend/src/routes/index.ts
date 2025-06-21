import { loggerMiddleware } from '@/middleware/logger';
import { Hono } from 'hono';
import { authRoutes } from './auth';
import { categoriesRoutes } from './categories';
import { competitionsRoutes } from './competitions';
import { eventsRoutes } from './events';
import { clubsRoutes } from './clubs';
import { logsRoutes } from './logs';
import { organizationRoutes } from './organization';

/**
 * Creates and configures all API routes
 * Following the pattern: /api/{resource}/{action?}
 */
export function createApiRoutes() {
  const api = new Hono(); // Mount route modules
  api.get('/health', (c) => {
    return c.json({ status: 'ok' });
  });

  api.route('/logs', logsRoutes);

  // Global logging middleware for all API routes
  api.use('/*', loggerMiddleware);
  api.route('/auth', authRoutes);
  api.route('/events', eventsRoutes);
  api.route('/categories', categoriesRoutes);
  api.route('/clubs', clubsRoutes);
  api.route('/competitions', competitionsRoutes);
  api.route('/organization', organizationRoutes);

  return api;
}

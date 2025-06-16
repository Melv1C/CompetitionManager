import { loggerMiddleware } from '@/middleware/logger';
import { Hono } from 'hono';
import { authRoutes } from './auth';
import { categoriesRoutes } from './categories';
import { competitionsRoutes } from './competitions';
import { eventsRoutes } from './events';
import { logsRoutes } from './logs';

/**
 * Creates and configures all API routes
 * Following the pattern: /api/{resource}/{action?}
 */
export function createApiRoutes() {
  const api = new Hono(); // Mount route modules
  api.route('/logs', logsRoutes);
  
  // Global logging middleware for all API routes
  api.use('/*', loggerMiddleware);
  
  api.route('/auth', authRoutes);
  api.route('/events', eventsRoutes);
  api.route('/categories', categoriesRoutes);
  api.route('/competitions', competitionsRoutes);

  return api;
}

import { loggerMiddleware } from '@/middleware/logger';
import { FallBackLanguage, SupportedLanguages } from '@repo/core/schemas';
import { Hono } from 'hono';
import { languageDetector } from 'hono/language';
import { athletesRoutes } from './athletes';
import { authRoutes } from './auth';
import { categoriesRoutes } from './categories';
import { clubsRoutes } from './clubs';
import { competitionsRoutes } from './competitions';
import { eventsRoutes } from './events';
import { logsRoutes } from './logs';
import { organizationRoutes } from './organization';
import { usersRoutes } from './users';
import { webhooksRoutes } from './webhooks';

/**
 * Creates and configures all API routes
 * Following the pattern: /api/{resource}/{action?}
 */
export function createApiRoutes() {
  const api = new Hono(); // Mount route modules

  api.use(
    languageDetector({
      supportedLanguages: SupportedLanguages,
      fallbackLanguage: FallBackLanguage,
      order: ['querystring', 'header', 'cookie'],
      caches: ['cookie'],
    }),
  );

  api.get('/health', c => {
    return c.json({ status: 'ok' });
  });

  api.route('/logs', logsRoutes);

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

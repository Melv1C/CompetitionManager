import { env } from '@/lib/env';
import { createApiRoutes } from '@/routes';
import { SupportedLanguages, FallBackLanguage } from '@repo/core/schemas';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { languageDetector } from 'hono/language';
import { i18nMiddleware } from './middleware/i18n-middleware';

export function getAPI() {
  const app = new Hono();

  // Global CORS middleware for all API routes
  app.use(
    '/api/*',
    cors({
      origin: [env.FRONTEND_URL, env.DESKTOP_URL],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    }),
  );

  app.use(
    languageDetector({
      supportedLanguages: SupportedLanguages,
      fallbackLanguage: FallBackLanguage,
      order: ['querystring', 'header'],
      caches: false,
    }),
  );

  app.use(i18nMiddleware);

  // Mount all API routes under /api prefix
  const apiRoutes = createApiRoutes();
  app.route('/api', apiRoutes);

  return app;
}

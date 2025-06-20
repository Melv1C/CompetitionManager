import { env } from '@/lib/env';
import { createApiRoutes } from '@/routes';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

export function getAPI() {
  const app = new Hono();

  // Global CORS middleware for all API routes
  app.use(
    '/api/*',
    cors({
      origin: env.BETTER_AUTH_URL,
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      exposeHeaders: ['Content-Length'],
      maxAge: 600,
      credentials: true,
    })
  );

  // Mount all API routes under /api prefix
  const apiRoutes = createApiRoutes();
  app.route('/api', apiRoutes);

  return app;
}

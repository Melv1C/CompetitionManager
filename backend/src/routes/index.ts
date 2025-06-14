import { requireAuth } from '@/middleware/auth';
import { Hono } from 'hono';
import { authRoutes } from './auth';
import { logsRoutes } from './logs';

/**
 * Creates and configures all API routes
 * Following the pattern: /api/{resource}/{action?}
 */
export function createApiRoutes() {
  const api = new Hono();

  // Mount route modules
  api.route('/auth', authRoutes);
  api.route('/logs', logsRoutes);

  return api;
}

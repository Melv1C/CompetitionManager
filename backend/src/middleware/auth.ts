import { logger } from '@/lib/logger';
import { getUser } from '@/utils/auth-utils';
import type { Context, Next } from 'hono';

/**
 * Middleware that requires authentication - returns 401 if no user is present
 */
export async function requireAuth(c: Context, next: Next) {
  const user = await getUser(c);

  if (!user) {
    logger.warn('Access denied: No authenticated user', {
      path: c.req.path,
      method: c.req.method,
    });
    return c.json({ error: 'Authentication required' }, 401);
  }

  await next();
}

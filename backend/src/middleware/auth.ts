import { logger } from '@/lib/logger';
import { getUser } from '@/utils/auth-utils';
import { UserRole$ } from '@repo/core/schemas';
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

/**
 * Middleware that requires admin role - returns 403 if user is not an admin
 */
export async function requireAdmin(c: Context, next: Next) {
  const user = await getUser(c);

  if (!user || user.role !== UserRole$.enum.admin) {
    logger.warn('Access denied: User is not an admin', {
      userId: user?.id,
      path: c.req.path,
      method: c.req.method,
    });
    return c.json({ error: 'Admin role required' }, 403);
  }

  await next();
}

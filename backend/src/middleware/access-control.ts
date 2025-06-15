import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getUser } from '@/utils/auth-utils';
import { logError } from '@/utils/log-utils';
import type { OrganizationPermissionCheck, PermissionCheck } from '@competition-manager/core/utils';
import type { Context, Next } from 'hono';

/**
 * Access control middleware factory
 * Creates middleware that checks if the current user has required permissions
 */
export function requirePermissions(permissions: PermissionCheck) {
  return async (c: Context, next: Next) => {
    try {
      // Get authenticated user using predefined utility
      const user = await getUser(c);

      if (!user) {
        logger.warn('Access denied: No authenticated user', {
          path: c.req.path,
          method: c.req.method,
        });
        return c.json({ error: 'Authentication required' }, 401);
      }

      // Check user permissions
      const hasPermission = await auth.api.userHasPermission({
        body: {
          userId: user.id,
          permissions,
        },
      });

      if (!hasPermission) {
        logger.warn('Access denied: Insufficient permissions', {
          userId: user.id,
          path: c.req.path,
          method: c.req.method,
          requiredPermissions: permissions,
        });
        return c.json({ error: 'Insufficient permissions' }, 403);
      }

      // Log successful access
      logger.debug('Access granted', {
        userId: user.id,
        path: c.req.path,
        method: c.req.method,
        permissions,
      });

      await next();
    } catch (error) {
      logError('Access control error', error, c);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };
}

export function requireOrganizationPermissions(permissions: OrganizationPermissionCheck) {
  return async (c: Context, next: Next) => {
    try {
      // Get authenticated user using predefined utility
      const user = await getUser(c);

      if (!user) {
        logger.warn('Access denied: No authenticated user', {
          path: c.req.path,
          method: c.req.method,
        });
        return c.json({ error: 'Authentication required' }, 401);
      }

      // Check user organization permissions
      const hasPermission = await auth.api.hasPermission({
        headers: c.req.raw.headers,
        body: {
          permissions,
        },
      });

      if (!hasPermission) {
        logger.warn('Access denied: Insufficient organization permissions', {
          userId: user.id,
          path: c.req.path,
          method: c.req.method,
          requiredPermissions: permissions,
        });
        return c.json({ error: 'Insufficient organization permissions' }, 403);
      }

      // Log successful access
      logger.debug('Access granted', {
        userId: user.id,
        path: c.req.path,
        method: c.req.method,
        permissions,
      });

      await next();
    } catch (error) {
      logError('Access control error', error, c);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };
}
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import type { Context, Next } from 'hono';

export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Try to get userId from session if available
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    userId = session?.user?.id;
  } catch {
    // Ignore auth errors for logging
  }

  logger.log('http', 'Request completed', {
    method,
    path,
    status,
    duration,
    userId,
  });
};

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { getUser } from '@/utils/auth-utils';
import type { Context, Next } from 'hono';

export const loggerMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  const user = await getUser(c);

  logger.log('http', 'Request completed', {
    method,
    path,
    status,
    duration,
    userId: user?.id,
  });
};

import { auth } from '@/lib/auth';
import type { Context } from 'hono';

export async function getUser(c: Context) {
  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionData?.user) {
    return null;
  }

  return sessionData.user;
}

export async function getRequiredUser(c: Context) {
  const user = await getUser(c);
  if (!user) {
    throw new Error('User is not authenticated');
  }
  return user;
}
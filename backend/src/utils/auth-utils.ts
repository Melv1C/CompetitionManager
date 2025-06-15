import { auth } from '@/lib/auth';
import type { Context } from 'hono';

export async function getSession(c: Context) {
  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionData) {
    return null;
  }

  return sessionData.session;
}

export async function getRequiredSession(c: Context) {
  const session = await getSession(c);
  if (!session) {
    throw new Error('User is not authenticated');
  }
  return session;
}

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
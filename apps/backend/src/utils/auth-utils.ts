import { Context } from 'hono';

export const getSession = (c: Context) => {
  const session = c.get('session');
  if (!session) {
    throw new Error('Session not found in context');
  }
  return session;
};

export const getUser = (c: Context) => {
  const user = c.get('user');
  if (!user) {
    throw new Error('User not found in context');
  }
  return user;
};

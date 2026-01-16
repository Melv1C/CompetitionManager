import { Hono } from 'hono';

export const healthRoutes = new Hono().get('/', c => {
  return c.json(
    {
      status: 'ok',
    },
    200,
  );
});

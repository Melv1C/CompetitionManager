import { auth } from '@/lib/auth';
import { Hono } from 'hono';

const authRoutes = new Hono();

// Handle all auth endpoints
authRoutes.on(['POST', 'GET'], '/**', (c) => auth.handler(c.req.raw));

export { authRoutes };

import { auth } from '@/lib/auth';
import { env } from '@/lib/env';
import { createSocketServer } from '@/lib/socket';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '/api/auth/*', // or replace with "*" to enable cors for all routes
  cors({
    origin: env.BETTER_AUTH_URL,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

const httpServer = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

// Initialize Socket.IO server
const io = createSocketServer(httpServer);

console.log('Socket.IO server initialized');

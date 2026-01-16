import { env } from '@/lib/env';
import { routes } from '@/routes';
import { serve } from '@hono/node-server';
import { APP_NAME, APP_VERSION, FallBackLanguage, SupportedLanguages } from '@repo/utils';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { languageDetector } from 'hono/language';
import { createSocketServer, setIoInstance } from './lib/socket';
import { i18nMiddleware } from './middleware/i18n-middleware';

const app = new Hono()
  .use(
    cors({
      origin: [env.FRONTEND_URL, env.ADMIN_URL],
      credentials: true,
    }),
  )
  .use(
    languageDetector({
      supportedLanguages: SupportedLanguages,
      fallbackLanguage: FallBackLanguage,
      order: ['querystring', 'header'],
      caches: false,
    }),
  )
  .use(i18nMiddleware)
  .route('/api', routes);

export type AppType = typeof app;

const httpServer = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  info => {
    console.log(`🚀 Backend server running on port ${info.port}`);
    console.log(`   App Name: ${APP_NAME}`);
    console.log(`   App Version: ${APP_VERSION}`);
  },
);

const io = createSocketServer(httpServer);
setIoInstance(io);

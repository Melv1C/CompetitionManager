import { requireCronSecret } from '@/middleware/cron';
import { Hono } from 'hono';
import { athleteSyncRoutes } from './athlete-sync';
import { logCleanupRoutes } from './log-cleanup';

const cronRoutes = new Hono();

cronRoutes.use('/*', requireCronSecret);
cronRoutes.route('/athlete-sync', athleteSyncRoutes);
cronRoutes.route('/log-cleanup', logCleanupRoutes);

export { cronRoutes };

import { requireCronSecret } from '@/middleware/auth';
import { Hono } from 'hono';
import { athleteSyncRoutes } from './athlete-sync';

const cronRoutes = new Hono();

cronRoutes.use('/*', requireCronSecret);
cronRoutes.route('/athlete-sync', athleteSyncRoutes);

export { cronRoutes };

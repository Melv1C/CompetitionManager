import { fetchAndSyncAthlete } from '@/utils/fetch-sync-athlete';
import { Hono } from 'hono';

export const athleteSyncRoutes = new Hono().post('/', async c => {
  const { created, updated, skipped } = await fetchAndSyncAthlete();
  return c.json({ message: 'Athlete sync job executed', created, updated, skipped });
});

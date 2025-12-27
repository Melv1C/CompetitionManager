import { fetchAndSyncAthlete } from '@/utils/fetch-sync-athlete';
import { Hono } from 'hono';

const athleteSyncRoutes = new Hono();

athleteSyncRoutes.get('/', async c => {
  const { created, updated, skipped } = await fetchAndSyncAthlete();
  return c.json({ message: 'Athlete sync job executed', created, updated, skipped });
});

export { athleteSyncRoutes };

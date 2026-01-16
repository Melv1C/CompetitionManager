import { fetchAndSyncAthlete } from '@/utils/fetch-sync-athlete';
import { logError } from '@/utils/log-utils';
import { Hono } from 'hono';

const athleteSyncRoutes = new Hono();

athleteSyncRoutes.post('/', async c => {
  try {
    const { created, updated, skipped } = await fetchAndSyncAthlete();
    return c.json({ message: 'Athlete sync job executed', created, updated, skipped });
  } catch (error) {
    logError('Failed to sync athlete', error, c);
    return c.json({ error: 'Failed to sync athlete' }, 500);
  }
});

export { athleteSyncRoutes };

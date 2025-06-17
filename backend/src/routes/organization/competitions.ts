import { requireOrganizationPermissions } from '@/middleware/access-control';
import { requireAuth } from '@/middleware/auth';
import { getRequiredSession } from '@/utils/auth-utils';
import { getCompetitions } from '@/utils/competition-utils';
import { logError } from '@/utils/log-utils';
import { logger } from 'better-auth';
import { Hono } from 'hono';

const organizationCompetitionsRoutes = new Hono();

// GET /organization/competitions - Get competitions for the active organization
organizationCompetitionsRoutes.get(
  '/',
  requireAuth,
  requireOrganizationPermissions({
    competitions: ['read'],
  }),
  async (c) => {
    try {
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', {
          session,
        });
        return c.json({ error: 'No active organization found' }, 400);
      }

      const competitions = await getCompetitions({
        where: {
          organizationId: session.activeOrganizationId,
        },
        orderBy: { startDate: 'desc' },
      });

      return c.json(competitions);
    } catch (error) {
      logError('Failed to fetch organization competitions', error, c);
      return c.json(
        { error: 'Failed to fetch organization competitions' },
        500
      );
    }
  }
);

export { organizationCompetitionsRoutes };

import { Hono } from 'hono';
import { organizationCompetitionEventsRoutes } from './competition-events';
import { organizationCompetitionsRoutes } from './competitions';
import { organizationInscriptionsRoutes } from './inscriptions';

/**
 * Organization routes handler
 * Groups all organization-specific routes under /api/organization
 */
const organizationRoutes = new Hono();

// Mount organization-specific route modules
organizationRoutes.route('/competitions', organizationCompetitionsRoutes);
organizationRoutes.route('/competitions', organizationCompetitionEventsRoutes);
organizationRoutes.route('/competitions', organizationInscriptionsRoutes);

export { organizationRoutes };

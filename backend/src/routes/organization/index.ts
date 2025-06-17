import { Hono } from 'hono';
import { organizationCompetitionsRoutes } from './competitions';

/**
 * Organization routes handler
 * Groups all organization-specific routes under /api/organization
 */
const organizationRoutes = new Hono();

// Mount organization-specific route modules
organizationRoutes.route('/competitions', organizationCompetitionsRoutes);

export { organizationRoutes };

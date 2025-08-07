import { Hono } from 'hono';
import { userInscriptionsRoutes } from './inscriptions';
import { userPaymentSessionsRoutes } from './payment-sessions';

/**
 * User routes handler
 * Groups all user-specific routes under /api/users
 */
const usersRoutes = new Hono();

// Mount user-specific route modules
usersRoutes.route('/', userInscriptionsRoutes);
usersRoutes.route('/', userPaymentSessionsRoutes);

export { usersRoutes };

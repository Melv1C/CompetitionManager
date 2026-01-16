import { Hono } from 'hono';
import { userInscriptionsRoutes } from './inscriptions';
import { userCheckoutSessionRoutes } from './checkout-session';
import { userAlreadyPaidRoutes } from './already-paid';

/**
 * User routes handler
 * Groups all user-specific routes under /api/users
 */
const usersRoutes = new Hono();

// Mount user-specific route modules
usersRoutes.route('/me/inscriptions', userInscriptionsRoutes);
usersRoutes.route('/me/checkout-sessions', userCheckoutSessionRoutes);
usersRoutes.route('/me/already-paid', userAlreadyPaidRoutes);

export { usersRoutes };

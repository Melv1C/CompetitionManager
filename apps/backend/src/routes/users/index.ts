import { isAuthenticated } from '@/middleware/use-auth';
import { Hono } from 'hono';
import { userAlreadyPaidRoutes } from './already-paid';
import { userCheckoutSessionRoutes } from './checkout-session';
import { userInscriptionsRoutes } from './inscriptions';

/**
 * User routes handler
 * Groups all user-specific routes under /api/users
 */
export const usersRoutes = new Hono()
  .use(isAuthenticated)
  .route('/me/inscriptions', userInscriptionsRoutes)
  .route('/me/checkout-sessions', userCheckoutSessionRoutes)
  .route('/me/already-paid', userAlreadyPaidRoutes);

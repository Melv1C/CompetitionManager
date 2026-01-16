import { getUser } from '@/utils/auth-utils';
import {
  expireCheckoutSession,
  getCheckoutSessionById,
  getOpenCheckoutSessionsByCustomerId,
} from '@/utils/checkout-session-utils';
import { cancelInscriptions } from '@/utils/inscription-utils';
import { Hono } from 'hono';

export const userCheckoutSessionRoutes = new Hono()

  // GET /users/me/checkout-sessions
  .get('/', async c => {
    const user = getUser(c);
    if (!user.stripeCustomerId) {
      return c.json([]);
    }
    const checkoutSessions = await getOpenCheckoutSessionsByCustomerId(user.stripeCustomerId);
    return c.json(checkoutSessions);
  })

  // DELETE /users/me/checkout-sessions/:id
  .delete('/:id', async c => {
    const user = getUser(c);
    if (!user.stripeCustomerId) {
      return c.json({ error: 'User does not have a Stripe customer ID' }, 400);
    }
    const sessionId = c.req.param('id');
    // Check if the session belongs to the user
    const checkoutSession = await getCheckoutSessionById(sessionId);
    if (!checkoutSession || checkoutSession.customerId !== user.stripeCustomerId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await expireCheckoutSession(sessionId);
    if (!result) {
      return c.json({ error: 'Failed to expire checkout session' }, 500);
    }

    // Same logic as in the webhook handler for 'checkout.session.expired'
    // But we do it here synchronously for this case to avoid potential race conditions
    await cancelInscriptions(sessionId);

    return c.json({ success: true });
  });

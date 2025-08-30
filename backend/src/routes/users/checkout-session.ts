import { getRequiredUser } from '@/utils/auth-utils';
import {
  expireCheckoutSession,
  getCheckoutSessionById,
  getOpenCheckoutSessionsByCustomerId,
} from '@/utils/checkout-session-utils';
import { logError } from '@/utils/log-utils';
import { Hono } from 'hono';

export const userCheckoutSessionRoutes = new Hono();

// GET /users/me/checkout-sessions
userCheckoutSessionRoutes.get('/', async c => {
  try {
    const user = await getRequiredUser(c);
    if (!user.stripeCustomerId) {
      return c.json({ error: 'User does not have a Stripe customer ID' }, 400);
    }
    const checkoutSessions = await getOpenCheckoutSessionsByCustomerId(user.stripeCustomerId);
    return c.json(checkoutSessions);
  } catch (error) {
    logError('Failed to fetch user checkout sessions', error, c);
    return c.json({ error: 'Failed to fetch user checkout sessions' }, 500);
  }
});

// PUT /users/me/checkout-sessions/:id/expire
userCheckoutSessionRoutes.put('/:id/expire', async c => {
  try {
    const user = await getRequiredUser(c);
    if (!user.stripeCustomerId) {
      return c.json({ error: 'User does not have a Stripe customer ID' }, 400);
    }
    const sessionId = c.req.param('id');
    // Check if the session belongs to the user
    const checkoutSession = await getCheckoutSessionById(sessionId);
    if (!checkoutSession || checkoutSession.customer !== user.stripeCustomerId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const result = await expireCheckoutSession(sessionId);
    if (!result) {
      return c.json({ error: 'Failed to expire checkout session' }, 500);
    }
    return c.json({ success: true });
  } catch (error) {
    logError('Failed to expire checkout session', error, c);
    return c.json({ error: 'Failed to expire checkout session' }, 500);
  }
});

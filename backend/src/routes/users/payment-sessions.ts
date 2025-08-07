import { getRequiredSession } from '@/utils/auth-utils';
import {
  cancelPaymentSession,
  getPaymentSessionByEid,
  getUserPaymentSessions,
} from '@/utils/payment-session-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import { Cuid$, PaymentSession$ } from '@repo/core/schemas';
import { Hono } from 'hono';
import { z } from 'zod/v4';

const userPaymentSessionsRoutes = new Hono();

// GET /users/me/payment-sessions - Get all payment sessions for the current user
userPaymentSessionsRoutes.get('/me/payment-sessions', async (c) => {
  try {
    const session = await getRequiredSession(c);

    const paymentSessions = await getUserPaymentSessions(session.userId);

    return c.json(PaymentSession$.array().parse(paymentSessions));
  } catch (error) {
    logError('Failed to fetch user payment sessions', error, c);
    return c.json({ error: 'Failed to fetch payment sessions' }, 500);
  }
});

// GET /users/me/payment-sessions/:eid - Get specific payment session for stripe payment page
userPaymentSessionsRoutes.get(
  '/me/payment-sessions/:eid',
  zValidator('param', z.object({ eid: Cuid$ })),
  async (c) => {
    try {
      const session = await getRequiredSession(c);
      const { eid } = c.req.valid('param');

      const paymentSession = await getPaymentSessionByEid(eid, session.userId);

      if (!paymentSession) {
        return c.json({ error: 'Payment session not found' }, 404);
      }

      if (paymentSession.status !== 'pending') {
        return c.json({ error: 'Payment session is not active' }, 400);
      }

      if (paymentSession.expiresAt < new Date()) {
        return c.json({ error: 'Payment session has expired' }, 400);
      }

      return c.json(PaymentSession$.parse(paymentSession));
    } catch (error) {
      logError('Failed to fetch payment session', error, c);
      return c.json({ error: 'Failed to fetch payment session' }, 500);
    }
  }
);

// DELETE /users/me/payment-sessions/:eid - Cancel payment session and delete related inscriptions
userPaymentSessionsRoutes.delete(
  '/me/payment-sessions/:eid',
  zValidator('param', z.object({ eid: Cuid$ })),
  async (c) => {
    try {
      const session = await getRequiredSession(c);
      const { eid } = c.req.valid('param');

      // First get the payment session to get the ID
      const paymentSession = await getPaymentSessionByEid(eid, session.userId);

      if (!paymentSession) {
        return c.json({ error: 'Payment session not found' }, 404);
      }

      await cancelPaymentSession(paymentSession.id, session.userId);

      return c.json({ success: true, message: 'Payment session cancelled' });
    } catch (error) {
      logError('Failed to cancel payment session', error, c);
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to cancel payment session',
        },
        400
      );
    }
  }
);

export { userPaymentSessionsRoutes };

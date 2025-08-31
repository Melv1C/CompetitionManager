import { env } from '@/lib/env';
import { logError } from '@/utils/log-utils';
import { Hono } from 'hono';
import Stripe from 'stripe';

const webhooksRoutes = new Hono();

// POST /webhooks/stripe - Handle Stripe webhook events
webhooksRoutes.post('/stripe', async c => {
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const sig = c.req.header('stripe-signature');

    if (!sig) {
      return c.json({ error: 'Missing stripe signature' }, 400);
    }

    const body = await c.req.text();
    const event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout session completed:', event.data);
        // TODO
        break;
      case 'checkout.session.expired':
        console.log('Checkout session expired:', event.data);
        // TODO
        break;
      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error) {
    logError('Stripe webhook error', error, c);
    return c.json({ error: 'Webhook handler failed' }, 400);
  }
});

export { webhooksRoutes };

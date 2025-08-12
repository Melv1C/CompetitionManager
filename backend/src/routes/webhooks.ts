import { logError } from '@/utils/log-utils';
import { Hono } from 'hono';

const webhooksRoutes = new Hono();

// POST /webhooks/stripe - Handle Stripe webhook events
webhooksRoutes.post('/stripe', async (c) => {
  try {
    const sig = c.req.header('stripe-signature');

    if (!sig) {
      return c.json({ error: 'Missing stripe signature' }, 400);
    }

    // TODO: Verify the webhook signature with Stripe
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    // const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

    // For now, we'll parse the body directly (should be replaced with proper signature verification)
    const event = await c.req.json();

    if (event.type === 'payment_intent.succeeded') {
      // TODO
    }

    return c.json({ received: true });
  } catch (error) {
    logError('Stripe webhook error', error, c);
    return c.json({ error: 'Webhook handler failed' }, 400);
  }
});

export { webhooksRoutes };

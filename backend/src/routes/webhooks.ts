import {
  updatePaymentSessionStatus,
  findPaymentSessionByPaymentIntent,
} from '@/utils/payment-session-utils';
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
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Find the payment session associated with this payment intent
      const paymentSession = await findPaymentSessionByPaymentIntent(
        paymentIntentId
      );

      if (paymentSession) {
        // Update payment session and related inscriptions
        await updatePaymentSessionStatus(
          paymentSession.id,
          'paid',
          paymentIntentId
        );

        console.log(`Payment confirmed for session ${paymentSession.eid}`);
      } else {
        console.warn(
          `No payment session found for payment intent ${paymentIntentId}`
        );
      }
    }

    return c.json({ received: true });
  } catch (error) {
    logError('Stripe webhook error', error, c);
    return c.json({ error: 'Webhook handler failed' }, 400);
  }
});

export { webhooksRoutes };

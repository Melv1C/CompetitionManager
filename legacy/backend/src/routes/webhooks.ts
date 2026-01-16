import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { cancelInscriptions } from '@/utils/inscriptions';
import { logError } from '@/utils/log-utils';
import { CheckoutSessionMetadata$, InscriptionStatus$ } from '@repo/core/schemas';
import { Hono } from 'hono';
import Stripe from 'stripe';

export const webhooksRoutes = new Hono();

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
      case 'checkout.session.completed': {
        logger.info('Stripe webhook: checkout.session.completed', { eventData: event.data });
        const metadata = CheckoutSessionMetadata$.parse(event.data.object.metadata);

        await prisma.inscription.updateMany({
          where: {
            stripeSessionId: event.data.object.id,
            status: InscriptionStatus$.enum.PENDING_PAYMENT,
          },
          data: { status: InscriptionStatus$.enum.REGISTERED, stripeSessionId: null },
        });

        await Promise.all(
          metadata.athletes.map(async athlete => {
            if (athlete.amountToPay <= 0) {
              return;
            }
            return await prisma.transaction.create({
              data: {
                user: { connect: { id: metadata.userId } },
                athlete: { connect: { id: athlete.athleteId } },
                competition: { connect: { id: metadata.competitionId } },
                amountPaid: athlete.amountToPay,
                paidAt: new Date(),
                stripeSessionId: event.data.object.id,
              },
            });
          }),
        );

        // TODO: Send a confirmation email

        break;
      }
      case 'checkout.session.expired': {
        logger.info('Stripe webhook: checkout.session.expired', { eventData: event.data });

        await cancelInscriptions(event.data.object.id);

        break;
      }
      default: {
        logger.warn(`Unhandled event type: ${event.type}`, { eventData: event.data });
        break;
      }
    }

    return c.json({ received: true }, 200);
  } catch (error) {
    logError('Stripe webhook error', error, c);
    return c.json({ error: 'Webhook handler failed' }, 400);
  }
});

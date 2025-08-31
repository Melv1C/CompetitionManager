import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { getRequiredSession, getRequiredUser } from '@/utils/auth-utils';
import {
  createCheckoutSession,
  createCustomer,
  getOpenCheckoutSessionsByCustomerId,
} from '@/utils/checkout-session-utils';
import {
  calculateAlreadyPaidAmount,
  calculateTotalEventCost,
  upsertInscriptionsInDB,
  validateInscriptions,
} from '@/utils/inscription-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  Competition$,
  Cuid$,
  InscriptionPublic$,
  InscriptionStatus$,
  Language$,
  UpsertInscriptions$,
  competitionInclude,
  inscriptionInclude,
} from '@repo/core/schemas';
import { Hono } from 'hono';
import { z } from 'zod';

export const competitionInscriptionsRoutes = new Hono();

// GET /competitions/:eid/inscriptions - Get public inscriptions for a competition
competitionInscriptionsRoutes.get(
  '/:eid/inscriptions',
  zValidator('param', z.object({ eid: Cuid$ })),
  async c => {
    try {
      const { eid } = c.req.valid('param');

      // First check if competition exists and is published
      const competition = await prisma.competition.findFirst({
        where: { eid, isPublished: true },
        select: { id: true },
      });

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      // Get all non-deleted inscriptions for this competition
      const inscriptions = await prisma.inscription.findMany({
        where: {
          competitionId: competition.id,
          status: {
            not: InscriptionStatus$.enum.CANCELLED,
          },
        },
        include: inscriptionInclude,
        orderBy: [{ inscriptionDate: 'desc' }],
      });

      return c.json(InscriptionPublic$.array().parse(inscriptions));
    } catch (error) {
      logError('Failed to fetch competition inscriptions', error, c);
      return c.json({ error: 'Failed to fetch competition inscriptions' }, 500);
    }
  },
);

// POST /competitions/:eid/inscriptions - Create inscriptions for a competition
competitionInscriptionsRoutes.post(
  '/:eid/inscriptions',
  zValidator('param', z.object({ eid: Cuid$ })),
  zValidator('json', UpsertInscriptions$),
  async c => {
    try {
      const session = await getRequiredSession(c);
      const user = await getRequiredUser(c);

      if (user.stripeCustomerId) {
        const sessions = await getOpenCheckoutSessionsByCustomerId(user.stripeCustomerId);
        if (sessions.length > 0) {
          return c.json(
            {
              error:
                'You have an active checkout session. Please complete it before creating new inscriptions.', // TODO: Translate this message
            },
            400,
          );
        }
      }

      const { eid } = c.req.valid('param');
      const inscriptions = c.req.valid('json');

      // Get competition
      const competition = Competition$.parse(
        await prisma.competition.findFirst({
          where: { eid, isPublished: true },
          include: competitionInclude,
        }),
      );

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      await validateInscriptions(competition, inscriptions, session.userId);

      const alreadyPaid = await calculateAlreadyPaidAmount(
        competition,
        inscriptions.map(i => i.athleteId),
        session.userId,
      );

      const totalEventCost = calculateTotalEventCost(competition, inscriptions);

      if (totalEventCost > alreadyPaid) {
        // return c.json({ error: 'Additional payment required for these inscriptions' }, 400);

        // check if the user has already a customer ID
        if (!user.stripeCustomerId) {
          const customer = await createCustomer(user);
          await prisma.user.update({
            where: { id: user.id },
            data: { stripeCustomerId: customer.id },
          });
          user.stripeCustomerId = customer.id;
        }

        const events = competition.events.filter(event =>
          inscriptions.some(i => i.competitionEventId === event.id),
        );

        const stripeSession = await createCheckoutSession({
          customerId: user.stripeCustomerId,
          items: events.map(event => ({
            price_data: {
              currency: 'eur',
              product_data: {
                name: event.name,
              },
              unit_amount: event.price * 100, // Convert to cents
            },
            quantity: inscriptions.filter(i => i.competitionEventId === event.id).length,
          })),
          successUrl: `${env.BETTER_AUTH_URL}`,
          cancelUrl: `${env.BETTER_AUTH_URL}`,
          locale: Language$.parse(c.get('language')),
          metadata: {
            userId: session.userId,
            competitionId: competition.id.toString(),
            athletes: JSON.stringify(
              inscriptions.map(i => {
                return {
                  id: i.athleteId,
                  amountPaid: calculateAlreadyPaidAmount(
                    competition,
                    [i.athleteId],
                    session.userId,
                  ),
                };
              }),
            ),
          },
        });

        if (!stripeSession.url) {
          return c.json({ error: 'Failed to create checkout session' }, 500);
        }

        await upsertInscriptionsInDB(
          competition,
          inscriptions,
          session.userId,
          InscriptionStatus$.enum.PENDING_PAYMENT,
          stripeSession.id,
        );

        console.log('Pending inscriptions:', inscriptions);

        // Redirect the user to the Stripe checkout page
        return c.json({ url: stripeSession.url }, 303);
      }

      await upsertInscriptionsInDB(
        competition,
        inscriptions,
        session.userId,
        InscriptionStatus$.enum.REGISTERED,
      );

      return c.status(200);
    } catch (error) {
      logError('Failed to create inscriptions', error, c);
      return c.json(
        {
          error: error instanceof Error ? error.message : 'Failed to create inscriptions',
        },
        400,
      );
    }
  },
);

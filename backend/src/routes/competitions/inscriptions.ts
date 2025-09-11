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
  upsertInscriptionsInDB,
  validateInscriptions,
} from '@/utils/inscription-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  Competition$,
  CompetitionEvent,
  Cuid$,
  Id,
  InscriptionPublic$,
  InscriptionStatus$,
  Language$,
  UpsertInscriptions$,
  athleteInclude,
  competitionInclude,
  inscriptionInclude,
} from '@repo/core/schemas';
import { getSeasonClub } from '@repo/core/utils';
import { Hono } from 'hono';
import { getFees } from 'node_modules/@repo/core/dist/utils/fees';
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

      const events = competition.events.filter(event =>
        inscriptions.some(i => i.competitionEventId === event.id),
      );

      await validateInscriptions(competition, inscriptions, session.userId);

      const alreadyPaid = await calculateAlreadyPaidAmount(
        competition,
        inscriptions.map(i => i.athleteId),
        session.userId,
      );

      const inscriptionGroupedByAthlete = inscriptions.reduce(
        (acc, curr) => {
          const existing = acc.find(a => a.athleteId === curr.athleteId);
          if (existing) {
            existing.inscriptions.push(curr);
          } else {
            acc.push({ athleteId: curr.athleteId, inscriptions: [curr] });
          }
          return acc;
        },
        [] as { athleteId: number; inscriptions: (typeof inscriptions)[number][] }[],
      );

      const getAthlete = async (athleteId: Id) => {
        const athlete = await prisma.athlete.findUnique({
          where: { id: athleteId },
          include: athleteInclude,
        });
        return athlete;
      };

      const athletesMap = await Promise.all(
        inscriptionGroupedByAthlete.map(async group => ({
          athleteId: group.athleteId,
          athlete: await getAthlete(group.athleteId),
        })),
      );

      // Helper to compute an athlete's already paid amount, total cost for requested inscriptions and net cost
      const computeAthleteNetCost = (
        athleteId: Id,
        inscriptionsForAthlete: (typeof inscriptions)[number][],
        eventsSource: CompetitionEvent[],
        alreadyPaidMap: Record<number, number>,
      ) => {
        const athlete = athletesMap.find(a => a.athleteId === athleteId)?.athlete;
        const isFree = competition.freeClubs
          .map(c => c.id)
          .includes(getSeasonClub(athlete)?.id || -1);
        if (isFree) {
          return { athleteAlreadyPaid: 0, athleteCost: 0, netCost: 0 };
        }
        const athleteAlreadyPaid = alreadyPaidMap[athleteId] || 0;
        const athleteCost = inscriptionsForAthlete.reduce((sum, inscription) => {
          const event = eventsSource.find(e => e.id === inscription.competitionEventId);
          return event ? sum + event.price : sum;
        }, 0);
        const netCost = athleteCost - athleteAlreadyPaid;
        return { athleteAlreadyPaid, athleteCost, netCost };
      };

      const totalCost = inscriptionGroupedByAthlete.reduce((total, athleteGroup) => {
        const { netCost } = computeAthleteNetCost(
          athleteGroup.athleteId,
          athleteGroup.inscriptions,
          events,
          alreadyPaid.perAthlete,
        );
        return total + (netCost > 0 ? netCost : 0);
      }, 0);

      if (totalCost > 0) {
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
          items: [
            ...(
              await Promise.all(
                inscriptionGroupedByAthlete.map(async athleteGroup => {
                  const athlete = await getAthlete(athleteGroup.athleteId);
                  const { netCost } = computeAthleteNetCost(
                    athleteGroup.athleteId,
                    athleteGroup.inscriptions,
                    events,
                    alreadyPaid.perAthlete,
                  );
                  if (netCost <= 0) return null;
                  return {
                    price_data: {
                      currency: 'eur',
                      product_data: {
                        name: `${athlete ? `${athlete.firstName} ${athlete.lastName}` : 'Athlete'} - ${
                          athleteGroup.inscriptions.length
                        } event${athleteGroup.inscriptions.length > 1 ? 's' : ''}`,
                      },
                      unit_amount: netCost > 0 ? netCost * 100 : 0, // Convert to cents
                    },
                    quantity: 1,
                  };
                }),
              )
            ).filter(element => element !== null),
            {
              // Add a separate item for the processing fee
              price_data: {
                currency: 'eur',
                product_data: {
                  name: c.var.t('checkout.fee_name'),
                },
                unit_amount: Math.round(getFees(totalCost) * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          successUrl: `${env.FRONTEND_URL}/competitions/${competition.eid}/register/success`,
          cancelUrl: `${env.FRONTEND_URL}/competitions/${competition.eid}/register`,
          locale: Language$.parse(c.get('language')),
          metadata: {
            userId: session.userId,
            competitionId: competition.id.toString(),
            athletes: JSON.stringify(
              inscriptionGroupedByAthlete
                .map(athleteGroup => {
                  const { netCost } = computeAthleteNetCost(
                    athleteGroup.athleteId,
                    athleteGroup.inscriptions,
                    events,
                    alreadyPaid.perAthlete,
                  );
                  if (netCost <= 0) return null;
                  return {
                    athleteId: athleteGroup.athleteId,
                    amountToPay: netCost > 0 ? netCost : 0,
                  };
                })
                .filter(element => element !== null),
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

        // Redirect the user to the Stripe checkout page
        return c.json({ url: stripeSession.url }, 303);
      }

      await upsertInscriptionsInDB(
        competition,
        inscriptions,
        session.userId,
        InscriptionStatus$.enum.REGISTERED,
      );

      // TODO: Send confirmation email

      return c.json({ success: true }, 201);
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

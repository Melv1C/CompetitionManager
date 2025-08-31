import { env } from '@/lib/env';
import { CheckoutSession, CheckoutSession$, Language, User } from '@repo/core/schemas';
import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const parseCheckoutSession = (session: Stripe.Checkout.Session): CheckoutSession => {
  return CheckoutSession$.parse({
    id: session.id,
    status: session.status,
    expiresAt: new Date(session.expires_at * 1000),
    url: session.url,
    customerId: session.customer,
  });
};

export const createCustomer = async (user: User) => {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      id: user.id,
    },
  });

  return customer;
};

type CreateCheckoutSessionParams = {
  customerId: string;
  items: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  locale: Language;
  metadata?: Stripe.Metadata;
  expiresAt?: number;
};

export const createCheckoutSession = async ({
  customerId,
  items,
  successUrl,
  cancelUrl,
  locale,
  metadata,
  expiresAt = Math.floor(Date.now() / 1000) + 1 * 60 * 60, // 1 hour from now
}: CreateCheckoutSessionParams) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card', 'bancontact'],
    line_items: items,
    locale: locale,
    expires_at: expiresAt,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return session;
};

export const getCheckoutSessionById = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return parseCheckoutSession(session);
};

export const getOpenCheckoutSessionsByCustomerId = async (customerId: string) => {
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: 'open',
  });

  return sessions.data.map(session => parseCheckoutSession(session));
};

export const expireCheckoutSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.expire(sessionId);
  return parseCheckoutSession(session);
};

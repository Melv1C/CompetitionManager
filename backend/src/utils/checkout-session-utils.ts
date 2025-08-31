import { env } from '@/lib/env';
import { Language, User } from '@repo/core/schemas';
import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_API_KEY);

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

export const createCheckoutSession = async (
  customerId: string,
  items: Stripe.Checkout.SessionCreateParams.LineItem[],
  successUrl: string,
  cancelUrl: string,
  locale: Language,
) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card', 'bancontact'],
    line_items: items,
    locale: locale,
    expires_at: Math.floor(Date.now() / 1000) + 1 * 60 * 60, // 1 hour from now
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
};

export const getCheckoutSessionById = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
};

export const getOpenCheckoutSessionsByCustomerId = async (customerId: string) => {
  const sessions = await stripe.checkout.sessions.list({
    customer: customerId,
    status: 'open',
  });

  return sessions;
};

export const expireCheckoutSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.expire(sessionId);
  return session;
};

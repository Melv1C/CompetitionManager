import { z } from 'zod';
import { Date$ } from './base';

export const CheckoutSessionStatus$ = z.enum(['open', 'completed', 'expired']);
export type CheckoutSessionStatus = z.infer<typeof CheckoutSessionStatus$>;

export const CheckoutSession$ = z.object({
  id: z.string(),
  status: CheckoutSessionStatus$,
  expiresAt: Date$,
  url: z.url().nullish(),
  customerId: z.string(),
});

export type CheckoutSession = z.infer<typeof CheckoutSession$>;

import { z } from 'zod';
import { BetterAuthId$, Date$ } from './base';

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

export const CheckoutSessionMetadata$ = z.object({
  userId: BetterAuthId$,
  competitionId: z.coerce.number().int(),
  athletes: z
    .string()
    .transform(val => JSON.parse(val) as { athleteId: number; amountToPay: number }[]),
});
export type CheckoutSessionMetadata = z.infer<typeof CheckoutSessionMetadata$>;

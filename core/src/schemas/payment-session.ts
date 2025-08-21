import { z } from 'zod';
import { BetterAuthId$, Cuid$, Date$, Id$ } from './base';

// Payment session status enum
export const PaymentSessionStatus$ = z.enum(['pending', 'paid', 'cancelled', 'expired']);
export type PaymentSessionStatus = z.infer<typeof PaymentSessionStatus$>;

// Payment session schema
export const PaymentSession$ = z.object({
  id: Id$,
  eid: Cuid$,

  userId: BetterAuthId$,
  competitionId: Id$,

  paymentIntentId: z.string().nullish(),
  status: PaymentSessionStatus$,
  amountTotal: z.number().min(0),
  metadata: z.record(z.string(), z.any()).nullish(),

  createdAt: Date$,
  expiresAt: Date$,
  paidAt: Date$.nullish(),
});
export type PaymentSession = z.infer<typeof PaymentSession$>;

export const CreatePaymentSession$ = PaymentSession$.omit({
  id: true,
  eid: true,
  createdAt: true,
  paidAt: true,
});
export type CreatePaymentSession = z.infer<typeof CreatePaymentSession$>;

import { z } from 'zod';
import { Id$, ParameterId$ } from './base';

export const Transaction$ = z.object({
  id: Id$,
  userId: z.string(),
  athleteId: Id$,
  competitionId: Id$,
  amountPaid: z.number().positive(),
  paidAt: z.date(),
  stripeSessionId: z.string(),
  createdAt: z.date(),
});

export type Transaction = z.infer<typeof Transaction$>;

// Schema for the already paid query parameters
export const AlreadyPaidQuery$ = z.object({
  competitionId: ParameterId$,
  athleteIds: z
    .union([
      z.array(ParameterId$),
      z.string().transform(str => str.split(',').map(id => parseInt(id.trim(), 10))),
    ])
    .transform(ids => (Array.isArray(ids) ? ids : [ids])),
});

export type AlreadyPaidQuery = z.infer<typeof AlreadyPaidQuery$>;

// Schema for the already paid response
export const AlreadyPaidResponse$ = z.object({
  perAthlete: z.record(z.string(), z.number().nonnegative()),
  total: z.number().nonnegative(),
});

export type AlreadyPaidResponse = z.infer<typeof AlreadyPaidResponse$>;

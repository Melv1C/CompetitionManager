import { z } from 'zod/v4';
import { BetterAuthId$, Boolean$, Cuid$, Date$, Id$ } from './base';
import { Athlete$, athleteInclude } from './athlete';
import {
  CompetitionEvent$,
  competitionEventInclude,
} from './competition-event';

// Record schema for personal records
export const Record$ = z.object({
  id: Id$,
  performanceValue: z.number(),
  achievedDate: Date$,
  location: z.string().nullish(),
});
export type Record = z.infer<typeof Record$>;

// Inscription status enum
export const InscriptionStatus$ = z.enum([
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'REFUNDED',
  'PENDING_PAYMENT',
]);
export type InscriptionStatus = z.infer<typeof InscriptionStatus$>;

// Presence status enum
export const PresenceStatus$ = z.enum(['PRESENT', 'ABSENT', 'UNKNOWN']);
export type PresenceStatus = z.infer<typeof PresenceStatus$>;

// Inscription base schema
export const Inscription$ = z.object({
  id: Id$,
  eid: Cuid$,

  userId: BetterAuthId$,
  athleteId: Id$,
  athlete: Athlete$,
  competitionEventId: Id$,
  competitionEvent: CompetitionEvent$,

  paymentSessionId: Id$.nullish(),

  record: Record$.nullish(),
  status: InscriptionStatus$,
  amountPaid: z.number().min(0),
  inscriptionDate: Date$,
  presenceStatus: PresenceStatus$.default('UNKNOWN'),
  isDeleted: Boolean$.default(false),

  createdAt: Date$,
  createdBy: BetterAuthId$,
  updatedAt: Date$,
  updatedBy: BetterAuthId$,
});
export type Inscription = z.infer<typeof Inscription$>;

export const inscriptionInclude = {
  athlete: { include: athleteInclude },
  competitionEvent: { include: competitionEventInclude },
  record: true,
};

export const InscriptionPrisma$ = Inscription$.omit({
  id: true,
  eid: true,
  athlete: true,
  competitionEvent: true,
  record: true,
  createdAt: true,
  updatedAt: true,
});
export type InscriptionPrisma = z.infer<typeof InscriptionPrisma$>;

export const UpsertInscription$ = InscriptionPrisma$.omit({
  createdBy: true,
  updatedBy: true,
  userId: true,
}).extend({
  record: Record$.extend({
    id: Id$.nullish(),
  }).optional(),
});
export type UpsertInscription = z.infer<typeof UpsertInscription$>;

export const UpsertInscriptions$ = UpsertInscription$.array();
export type UpsertInscriptions = z.infer<typeof UpsertInscriptions$>;

export const InscriptionPublic$ = Inscription$.pick({
  athlete: true,
  competitionEvent: true,
  record: true,
  inscriptionDate: true,
  status: true,
  presenceStatus: true,
});
export type InscriptionPublic = z.infer<typeof InscriptionPublic$>;

import z from 'zod/v4';
import { BetterAuthId$, Cuid$, Date$, Id$ } from './base';
import { Category$ } from './category';
import { Event$ } from './event';

// CompetitionEvent base schema
export const CompetitionEvent$ = z.object({
  id: Id$,
  eid: Cuid$,
  name: z.string(),
  eventStartTime: Date$,
  maxParticipants: z.number().int().nullish(),
  price: z.number(),

  createdAt: Date$,
  createdBy: BetterAuthId$,
  updatedAt: Date$,
  updatedBy: BetterAuthId$,

  competitionId: Id$,
  eventId: Id$,
  event: Event$,

  parentId: Id$.nullish(),

  categories: z.array(Category$).default([]),
});
export type CompetitionEvent = z.infer<typeof CompetitionEvent$>;

export const competitionEventInclude = {
  event: true,
  categories: true,
};

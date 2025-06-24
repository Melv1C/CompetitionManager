import z from 'zod/v4';
import { BetterAuthId$, Cuid$, Date$, Id$, ParameterId$ } from './base';
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

// Schema for creating a competition event directly with Prisma
export const CompetitionEventPrismaCreate$ = CompetitionEvent$.omit({
  id: true,
  eid: true,
  createdAt: true,
  updatedAt: true,
  event: true,
  categories: true,
});
export type CompetitionEventPrismaCreate = z.infer<typeof CompetitionEventPrismaCreate$>;

// Schema for API competition event creation
export const CompetitionEventCreate$ = CompetitionEventPrismaCreate$.omit({
  competitionId: true,
  createdBy: true,
  updatedBy: true,
}).extend({
  categoryIds: z.array(ParameterId$).optional(),
});
export type CompetitionEventCreate = z.infer<typeof CompetitionEventCreate$>;

// Schema for API competition event update
export const CompetitionEventUpdate$ = CompetitionEventCreate$.partial();
export type CompetitionEventUpdate = z.infer<typeof CompetitionEventUpdate$>;

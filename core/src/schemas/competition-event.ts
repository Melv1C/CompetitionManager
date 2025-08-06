import z from 'zod/v4';
import { BetterAuthId$, Cuid$, Date$, Id$ } from './base';
import { Category$ } from './category';
import { Event$ } from './event';

// CompetitionEvent base schema
export const CompetitionEvent$ = z.object({
  id: Id$,
  eid: Cuid$,
  name: z
    .string()
    .min(1, 'Event name is required')
    .max(100, 'Event name must be less than 100 characters'),
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
export const CompetitionEventPrisma$ = CompetitionEvent$.omit({
  id: true,
  eid: true,
  createdAt: true,
  updatedAt: true,
  event: true,
  categories: true,
});
export type CompetitionEventPrisma = z.infer<typeof CompetitionEventPrisma$>;

// Schema for API competition event creation
export const CompetitionEventCreate$ = CompetitionEventPrisma$.omit({
  competitionId: true,
  parentId: true,
  createdBy: true,
  updatedBy: true,
}).extend({
  categoryIds: z.array(Id$).default([]),
  // subEvents: z
  //   .array(
  //     CompetitionEvent$.pick({
  //       name: true,
  //       eventStartTime: true,
  //       eventId: true,
  //     }).extend({
  //       id: Id$.nullish(),
  //     })
  //   )
  //   .default([]),
});
export type CompetitionEventCreate = z.infer<typeof CompetitionEventCreate$>;

export const CompetitionEventUpdate$ = CompetitionEventCreate$;

export type CompetitionEventUpdate = z.infer<typeof CompetitionEventUpdate$>;

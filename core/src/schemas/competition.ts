import { z } from 'zod/v4';
import { BetterAuthId$, Boolean$, Cuid$, Date$, Id$ } from './base';
import { Club$ } from './club';
import {
  CompetitionEvent$,
  competitionEventInclude,
} from './competition-event';
import { Organization$ } from './organization';

// Competition base schema
export const Competition$ = z.object({
  id: Id$,
  eid: Cuid$,
  name: z.string(),
  startDate: z.date(),
  endDate: Date$.nullish(),
  isPublished: Boolean$.default(false),
  description: z.string().default(''),
  location: z.string().default(''),

  bibPermissions: z.array(z.string()).default([]),
  bibStartNumber: z.number().nullish(),

  isPaidOnline: Boolean$.default(true),
  isSelection: Boolean$.default(false),
  isInscriptionVisible: Boolean$.default(true),

  createdAt: Date$,
  createdBy: BetterAuthId$,
  updatedAt: Date$,
  updatedBy: BetterAuthId$,

  freeClubs: z.array(Club$).default([]),
  allowedClubs: z.array(Club$).default([]),

  events: z.array(CompetitionEvent$).default([]),

  organizationId: BetterAuthId$,
  organization: Organization$,
});
export type Competition = z.infer<typeof Competition$>;

export const competitionInclude = {
  freeClubs: true,
  allowedClubs: true,
  events: {
    include: competitionEventInclude,
  },
  organization: true,
};

export const CompetitionPrismaCreate$ = Competition$.omit({
  id: true,
  eid: true,
  createdAt: true,
  updatedAt: true,
  freeClubs: true,
  allowedClubs: true,
  events: true,
  organization: true,
});
export type CompetitionPrismaCreate = z.infer<typeof CompetitionPrismaCreate$>;

export const CompetitionCreate$ = CompetitionPrismaCreate$.pick({
  name: true,
  startDate: true,
});
export type CompetitionCreate = z.infer<typeof CompetitionCreate$>;

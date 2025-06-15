import { z } from 'zod/v4';
import { BetterAuthId$, Boolean$, Cuid$, Date$, Email$, Id$ } from './base';
import { Club$ } from './club';
import { CompetitionEvent$, competitionEventInclude } from './competition-event';

// Competition base schema
export const Competition$ = z.object({
  id: Id$,
  eid: Cuid$,
  name: z.string(),
  startDate: Date$,
  endDate: Date$,
  isPublished: Boolean$,
  description: z.string(),
  location: z.string(),

  contactEmail: Email$,
  contactPhone: z.string().nullable(),

  bibPermissions: z.array(z.string()),
  bibStartNumber: z.number().nullable(),

  isPaidOnline: Boolean$,
  isSelection: Boolean$,
  isInscriptionVisible: Boolean$,

  createdAt: Date$,
  createdBy: BetterAuthId$,
  updatedAt: Date$,
  updatedBy: BetterAuthId$,

  freeClubs: z.array(Club$).default([]),
  allowedClubs: z.array(Club$).default([]),

  events: z.array(CompetitionEvent$).default([]),

  organizationId: Id$,
});
export type Competition = z.infer<typeof Competition$>;

export const competitionInclude = {
  freeClubs: true,
  allowedClubs: true,
  events: {
    include: competitionEventInclude
  },
};
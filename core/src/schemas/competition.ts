import { z } from 'zod';
import { BetterAuthId$, Boolean$, Cuid$, Date$, Id$ } from './base';
import { Club$ } from './club';
import { CompetitionEvent$, competitionEventInclude } from './competition-event';
import { Organization$ } from './organization';

// Competition base schema
export const Competition$ = z.object({
  id: Id$,
  eid: Cuid$,
  name: z.string(),
  startDate: Date$,
  endDate: Date$,
  isPublished: Boolean$.default(false),
  description: z.string().default(''),
  location: z.string().default(''),

  bibPermissions: z.array(z.string()).default([]),
  bibStartNumber: z.number().nullish(),

  isPaidOnline: Boolean$.default(true),
  isSelection: Boolean$.default(false),
  isInscriptionVisible: Boolean$.default(true),

  inscriptionStartDate: Date$,
  inscriptionEndDate: Date$,

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

export const CompetitionPrisma$ = Competition$.omit({
  id: true,
  eid: true,
  createdAt: true,
  updatedAt: true,
  freeClubs: true,
  allowedClubs: true,
  events: true,
  organization: true,
})
  .refine(
    data => {
      // End date should be after start date
      return data.endDate > data.startDate;
    },
    {
      message: 'Competition end date must be after start date',
      path: ['endDate'],
    },
  )
  .refine(
    data => {
      // Inscription start date should be before inscription end date
      return data.inscriptionStartDate < data.inscriptionEndDate;
    },
    {
      message: 'Registration start date must be before registration end date',
      path: ['inscriptionStartDate'],
    },
  )
  .refine(
    data => {
      // Inscription end date should be before or equal to competition start date
      return data.inscriptionEndDate <= data.startDate;
    },
    {
      message: 'Registration end date cannot be later than competition start date',
      path: ['inscriptionEndDate'],
    },
  );
export type CompetitionPrisma = z.infer<typeof CompetitionPrisma$>;

export const CompetitionCreate$ = CompetitionPrisma$.pick({
  name: true,
  startDate: true,
});
export type CompetitionCreate = z.infer<typeof CompetitionCreate$>;

// Update schema for competitions, extending the create schema
export const CompetitionUpdate$ = CompetitionPrisma$.omit({
  organizationId: true,
  createdBy: true,
  updatedBy: true,
}).extend({
  freeClubIds: z.array(Id$).default([]),
  allowedClubIds: z.array(Id$).default([]),
});
export type CompetitionUpdate = z.infer<typeof CompetitionUpdate$>;

// Query schema for listing competitions
export const CompetitionQuery$ = z.object({
  upcoming: Boolean$.default(true),
  past: Boolean$.default(true),
  organizationId: BetterAuthId$.optional(),
});
export type CompetitionQuery = z.infer<typeof CompetitionQuery$>;

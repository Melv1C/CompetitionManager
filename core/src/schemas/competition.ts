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
  isPublished: Boolean$,
  description: z.string(),
  location: z.string(),

  contactPhone: z.string(),
  contactEmail: z.string(),

  bibPermissions: z.array(z.string()),
  bibStartNumber: z.number().int().positive().nullish(),

  isPaidOnline: Boolean$,
  isSelection: Boolean$,
  isInscriptionVisible: Boolean$,

  inscriptionStartDate: Date$,
  inscriptionEndDate: Date$,

  maxEventPerAthlete: z.number().int().positive().nullish(),
  hasConfirmation: Boolean$,
  confirmationDeadlineMinutes: z.number().int().positive().nullish(),

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
  .extend({
    isPublished: Boolean$.default(false),
    description: z.string().default(''),
    location: z.string().default(''),
    contactPhone: z.string().default(''),
    contactEmail: z.string().default(''),
    bibPermissions: z.array(z.string()).default([]),
    bibStartNumber: z.number().default(9000),
    isPaidOnline: Boolean$.default(true),
    isSelection: Boolean$.default(false),
    isInscriptionVisible: Boolean$.default(true),
    hasConfirmation: Boolean$.default(false),
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

export const CompetitionCreate$ = Competition$.pick({
  name: true,
  startDate: true,
});
export type CompetitionCreate = z.infer<typeof CompetitionCreate$>;

// Update schema for competitions, extending the create schema
export const CompetitionUpdate$ = Competition$.omit({
  id: true,
  eid: true,
  createdAt: true,
  updatedAt: true,
  freeClubs: true,
  allowedClubs: true,
  events: true,
  organization: true,
  organizationId: true,
  createdBy: true,
  updatedBy: true,
}).extend({
  freeClubIds: z.array(Id$),
  allowedClubIds: z.array(Id$),
});
export type CompetitionUpdate = z.infer<typeof CompetitionUpdate$>;

// Query schema for listing competitions
export const CompetitionQuery$ = z.object({
  upcoming: Boolean$.default(true),
  past: Boolean$.default(true),
  organizationId: BetterAuthId$.optional(),
});
export type CompetitionQuery = z.infer<typeof CompetitionQuery$>;

import { z } from 'zod';
import { Athlete$, athleteInclude } from './athlete';
import { BetterAuthId$, Cuid$, Date$, Id$ } from './base';
import { CompetitionEvent$, competitionEventInclude } from './competition-event';

export const Attempt$ = z.enum(['X', 'O', '-', 'r']);

// Result Detail schema
export const ResultDetail$ = z.object({
  attemptNumber: z.number().int().positive(),
  performanceValue: z.number(),
  attempts: z.array(Attempt$).max(3).default([]),
  windSpeed: z.number().nullish(),
  isBest: z.boolean(),
  isOfficialRecord: z.boolean(),
});
export type ResultDetail = z.infer<typeof ResultDetail$>;

// Result schema
export const Result$ = z.object({
  id: Id$,
  eid: Cuid$,
  competitionEvent: CompetitionEvent$,
  athlete: Athlete$,
  inscriptionId: Id$.nullish(),

  heatNumber: z.number().int().positive(),
  startingOrder: z.number().int().positive(),
  currentOrder: z.number().int().positive(),
  finalOrder: z.number().int().positive().nullish(),

  performanceValue: z.number().nullish(),
  windSpeed: z.number().nullish(),
  points: z.number().int().nullish(),

  createdAt: Date$,
  createdBy: BetterAuthId$,
  updatedAt: Date$,
  updatedBy: BetterAuthId$,

  details: z.array(ResultDetail$).default([]),
});
export type Result = z.infer<typeof Result$>;

export const resultInclude = {
  athlete: { include: athleteInclude },
  competitionEvent: { include: competitionEventInclude },
  details: true,
};

export const PrismaResult$ = Result$.omit({
  id: true,
  eid: true,
  athlete: true,
  competitionEvent: true,
  inscriptionId: true,
  details: true,
  createdAt: true,
  updatedAt: true,
});
export type PrismaResult = z.infer<typeof PrismaResult$>;

export const CreateResult$ = Result$.pick({
  heatNumber: true,
  startingOrder: true,
  inscriptionId: true,
}).extend({
  competitionEventId: Id$,
  athleteId: Id$,
});
export type CreateResult = z.infer<typeof CreateResult$>;

export const UpdateResultDetail$ = ResultDetail$.omit({
  isBest: true,
  isOfficialRecord: true,
});
export type UpdateResultDetail = z.infer<typeof UpdateResultDetail$>;

export const UpdateResult$ = Result$.pick({
  heatNumber: true,
  startingOrder: true,
  currentOrder: true,
}).extend({
  details: z.array(UpdateResultDetail$).default([]),
});
export type UpdateResult = z.infer<typeof UpdateResult$>;

export enum ResultCode {
  DNF = -1,
  DQ = -2,
  DNS = -3,
  NM = -4,
}

export enum ResultDetailCode {
  X = -1,
  PASS = -2,
  R = -3,
}

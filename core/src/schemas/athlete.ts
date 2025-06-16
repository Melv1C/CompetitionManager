import { z } from 'zod/v4';
import { Date$, Gender$, Id$ } from './base';
import { Club$ } from './club';

// AthleteInfo base schema
export const AthleteInfo$ = z.object({
  id: Id$,
  athleteId: Id$,
  season: z.coerce.number().positive().min(2025), // Assuming season starts from 2025
  clubId: Id$,
  club: Club$,
  bib: z.coerce.number(),
});
export type AthleteInfo = z.infer<typeof AthleteInfo$>;

export const athleteInfoInclude = {
  club: true,
};

// Athlete base schema
export const Athlete$ = z.object({
  id: Id$,
  license: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  gender: Gender$,
  birthdate: Date$,
  metadata: z.string().nullish(),
  createdAt: Date$,
  updatedAt: Date$,
  competitionId: Id$,
  athleteInfo: z.array(AthleteInfo$).default([]),
});

export type Athlete = z.infer<typeof Athlete$>;

export const athleteInclude = {
  athleteInfo: {
    include: athleteInfoInclude,
  },
};

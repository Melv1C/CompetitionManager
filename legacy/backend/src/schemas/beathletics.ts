import { z } from 'zod';

/**
 * Zod schemas for parsing the Beathletics API response
 * API endpoint: https://www.beathletics.be/api/athlete/new/{LICENSE}
 *
 * Uses passthrough() to allow extra fields and only extract what we need.
 * This makes the parsing more resilient to API changes.
 */

// Trial data - contains the actual performance value
const BeathleticsTrial$ = z.object({
  perfLegacy: z.string().nullable().optional(),
  rankingPerf: z.string().nullable().optional(),
  perftype: z.string().nullable().optional(),
  windSpeed: z.string().nullable().optional(),
  best: z.boolean().optional(),
  trialJson: z
    .object({
      perf: z
        .union([z.string(), z.number()])
        .nullable()
        .optional()
        .transform(val => (val !== null && val !== undefined ? Number(val) : null)),
      perfType: z.string().optional(),
    })
    .nullable()
    .optional(),
});

// Event type - discipline info
const BeathleticsEventType$ = z.object({
  abbr: z.string().optional(),
  name_fr: z.string().optional(),
  name_en: z.string().optional(),
  result_type: z.string().optional(),
});

// Competition info
const BeathleticsCompetition$ = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
});

// Discipline - links event type to competition
const BeathleticsDiscipline$ = z.object({
  name: z.string().optional(),
  abbr: z.string().nullable().optional(),
  venueType: z.string().optional(),
  eventType: BeathleticsEventType$.nullable().optional(),
  competition: BeathleticsCompetition$.nullable().optional(),
});

// Category info
const BeathleticsCategory$ = z.object({
  abbr: z.string().optional(),
});

// Result details
const BeathleticsResultDetail$ = z.object({
  rank: z.number().nullable().optional(),
  validationStatus: z.string().nullable().optional(),
  discipline: BeathleticsDiscipline$.nullable().optional(),
  category: BeathleticsCategory$.nullable().optional(),
  newTrials: z.array(BeathleticsTrial$).nullable().optional(),
});

// Single result item from the API response
export const BeathleticsResultItem$ = z.object({
  personalRecord: z.boolean().nullable().optional(),
  venueType: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  result: BeathleticsResultDetail$.nullable().optional(),
  category: BeathleticsCategory$.nullable().optional(),
});

// Base API response schema (without validating individual results)
export const BeathleticsApiResponseBase$ = z.object({
  results: z.array(z.unknown()).optional().default([]),
});

export type BeathleticsApiResponseBase = z.infer<typeof BeathleticsApiResponseBase$>;
export type BeathleticsResultItem = z.infer<typeof BeathleticsResultItem$>;

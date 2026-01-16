import { z } from 'zod';
import { Athlete$ } from './athlete';
import { EventType$ } from './event';

/**
 * Schemas for the athlete performances API
 * Endpoint: GET /api/athletes/:license/best-performances
 */

// A single performance record stored in cache
export const Performance$ = z.object({
  eventName: z.string(), // e.g., "100 mètres", "Saut en longueur"
  eventType: EventType$, // "time", "distance", "height", "points"
  value: z.number(), // milliseconds for time, meters for distance/height, points for combined
  wind: z.number().nullable(), // wind speed in m/s, null if not applicable
  date: z.string(), // ISO date string
  location: z.string(), // competition name/location
});
export type Performance = z.infer<typeof Performance$>;

// Full cache entry for an athlete
export const CachedAthletePerformances$ = z.object({
  license: z.string(),
  performances: z.array(Performance$),
  fetchedAt: z.string(), // ISO date when data was fetched
});
export type CachedAthletePerformances = z.infer<typeof CachedAthletePerformances$>;

// API response schema for best performances endpoint
export const AthleteBestPerformancesResponse$ = z.object({
  license: Athlete$.shape.license,
  bestPerformances: z.array(Performance$),
  cachedAt: z.string().optional(),
  fromDate: z.string().optional(),
});
export type AthleteBestPerformancesResponse = z.infer<typeof AthleteBestPerformancesResponse$>;

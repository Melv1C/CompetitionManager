import { z } from 'zod/v4';
import { Id$ } from './base';

// Club base schema
export const Club$ = z.object({
  id: Id$,
  name: z.string(),
  abbr: z.string(),
  address: z.string().nullish(),
  province: z.string().nullish(),
  country: z.string().nullish(),
  fedNumber: z.number().nullish(),
  fedAbbr: z.string().nullish(),
});
export type Club = z.infer<typeof Club$>;

// Club create schema (omit id)
export const ClubCreate$ = Club$.omit({ id: true });
export type ClubCreate = z.infer<typeof ClubCreate$>;

// Club update schema (all fields optional except id)
export const ClubUpdate$ = ClubCreate$.partial();
export type ClubUpdate = z.infer<typeof ClubUpdate$>;

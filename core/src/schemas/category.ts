import { z } from 'zod/v4';
import { Gender$, Id$ } from './base';

// Zod enum for abbreviated base categories
export const AbbrBaseCategory$ = z.enum([
  'KAN',
  'BEN',
  'PUP',
  'MIN',
  'CAD',
  'SCO',
  'JUN',
  'ESP',
  'SEN',
  'MAS',
]);
export type AbbrBaseCategory = z.infer<typeof AbbrBaseCategory$>;

// Zod enum for base categories
export const BaseCategory$ = z.enum([
  'Kangourou',
  'Benjamin',
  'Pupille',
  'Minime',
  'Cadet',
  'Scolaire',
  'Junior',
  'Espoir',
  'Senior',
  'Master',
]);
export type BaseCategory = z.infer<typeof BaseCategory$>;

// Category base schema
export const Category$ = z.object({
  id: Id$,
  name: z.string(),
  abbr: z.string(),
  baseCategory: BaseCategory$,
  abbrBaseCategory: AbbrBaseCategory$,
  gender: Gender$,
  masterAgeGroup: z.number().nullish(),
  order: z.number().positive(),
});
export type Category = z.infer<typeof Category$>;

// Category create schema (omit id)
export const CategoryCreate$ = Category$.omit({ id: true });
export type CategoryCreate = z.infer<typeof CategoryCreate$>;

// Category update schema (all fields optional except id)
export const CategoryUpdate$ = CategoryCreate$.partial();
export type CategoryUpdate = z.infer<typeof CategoryUpdate$>;

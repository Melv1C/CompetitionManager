import { z } from 'zod/v4';
import { Id$ } from './base';

// Club base schema
export const Club$ = z.object({
  id: Id$,
  name: z.string(),
  abbr: z.string(),
  address: z.string().nullable(),
  province: z.string().nullable(),
  country: z.string().nullable(),
  fedNumber: z.coerce.number().nullable(),
  fedAbbr: z.string().nullable(),
});
export type Club = z.infer<typeof Club$>;

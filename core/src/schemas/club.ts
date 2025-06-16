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
  fedNumber: z.coerce.number().nullish(),
  fedAbbr: z.string().nullish(),
});
export type Club = z.infer<typeof Club$>;

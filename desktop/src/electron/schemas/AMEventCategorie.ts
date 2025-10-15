import z from 'zod';

export const AMEventCategories = z.object({
  since: z.coerce.date().default(new Date()),
  event: z.number().int(),
  category: z.number().int(),
});

export type AMEvent = z.infer<typeof AMEventCategories>;
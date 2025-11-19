import z from 'zod';

export const AMCompetitorSchema = z.object({
  since: z.coerce.date().default(new Date()),
  athlete: z.number().int(),
  license: z.number().int().nullable(),
  competition: z.number().int(),
  bib: z.string().max(6).nullable(),
  displayname: z.string().max(256).nullable(),
  present_at_competition: z.number().int().nullable().default(0),
});

export type AMCompetitor = z.infer<typeof AMCompetitorSchema>;

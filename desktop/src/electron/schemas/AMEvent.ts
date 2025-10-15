import z from 'zod';

export const AMEventsSchema = z.object({
  since: z.coerce.date().default(new Date()),
  competition: z.number().int().default(1),
  name: z.string().max(256),
  abbreviation: z.string().max(30),
  info: z.string().max(256).default(''),
  type: z.number().int().default(1),
  seqno: z.number().int().default(0),
  medals: z.string().length(1).default('C'),
  status: z.number().default(5),
});

export type Event = z.infer<typeof AMEventsSchema>;
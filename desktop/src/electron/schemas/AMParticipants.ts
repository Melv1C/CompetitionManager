import z from 'zod';

export const AMParticipantSchema = z.object({
  since: z.coerce.date().nullable().default(new Date()),
  competitor: z.number().int(),
  participation: z.number().int(),
  seqno: z.number().int().nullable().default(1),
  participation_confirmed: z.number().int().nullable().default(0),
});

export type AMParticipant = z.infer<typeof AMParticipantSchema>;

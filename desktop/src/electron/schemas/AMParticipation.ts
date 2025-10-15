import z from 'zod';

export const AMParticipationSchema = z.object({
  since: z.coerce.date().default(new Date()),
  teamname: z.string().max(128).nullable().default(''),
  round: z.number().int().nullable(),
  heat: z.number().int().nullable().default(0),
  initialorder: z.number().int().nullable().default(0),
  currentorder: z.number().int().nullable().default(null),
  laneorder: z.number().int().nullable().default(0),
  transponder: z.string().max(128).nullable().default(null),
  bestresult: z.number().int().nullable().default(null),
  validresult: z.number().int().nullable().default(null),
  status: z.string().max(2).default('0'),
  rank: z.number().int().nullable().default(null),
  startheight: z.coerce.number().nullable().default(null),
  distance: z.coerce.number().nullable().default(null),
  abandoned: z.number().int().nullable().default(null),
  outofcompetition: z.number().int().nullable().default(null),
  qualified: z.string().length(1).nullable().default(null),
  info: z.string().max(64).nullable().default(null),
  category: z.bigint(),
  points: z.number().int().nullable().default(0),
  teampoints: z.coerce.number().nullable().default(0),
  currentorder_round: z.number().int().nullable().default(0),
  currentorder_manual: z.number().int().nullable().default(0),
  currentorder_round_manual: z.number().int().nullable().default(0),
  points_manual: z.number().int().nullable().default(0),
  teampoints_manual: z.coerce.number().nullable().default(0),
  currentorder_combined: z.number().int().nullable().default(0),
  teampoints_medals: z.string().length(1).nullable().default(null),
});

export type AMParticipation = z.infer<typeof AMParticipationSchema>;

import { z } from 'zod';
import { BetterAuthId$ } from './base';

export const LogType$ = z.enum(['REQUEST', 'APP']);
export type LogType = z.infer<typeof LogType$>;

export const LogLevel$ = z.enum(['debug', 'info', 'warn', 'error']);
export type LogLevel = z.infer<typeof LogLevel$>;

export const levelPriority: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export const Method$ = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
export type Method = z.infer<typeof Method$>;

export const LogStep$ = z.object({
  level: LogLevel$,
  message: z.string(),
  metadata: z.any().default({}),
  timestamp: z.number(),
});
export type LogStep = z.infer<typeof LogStep$>;

export const Log$ = z.object({
  id: z.int().positive(),
  type: LogType$,
  level: LogLevel$,
  message: z.string(),
  metadata: z.any().default({}),

  userId: BetterAuthId$.nullish(),
  method: Method$.nullish(),
  path: z.string().nullish(),
  statusCode: z.number().nullish(),
  durationMs: z.number().nullish(),
  steps: LogStep$.array().nullish(),

  createdAt: z.date(),
});
export type Log = z.infer<typeof Log$>;

export const LogCreate$ = Log$.extend({ type: LogType$.default('APP') }).omit({
  id: true,
  createdAt: true,
});
export type LogCreate = z.infer<typeof LogCreate$>;

// Filter and pagination schemas
export const LogFilter$ = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  types: z
    .preprocess(
      val => (typeof val === 'string' ? val.split(',').filter(Boolean) : val),
      LogType$.array(),
    )
    .optional(),
  levels: z
    .preprocess(
      val => (typeof val === 'string' ? val.split(',').filter(Boolean) : val),
      LogLevel$.array(),
    )
    .optional(),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
export type LogFilter = z.infer<typeof LogFilter$>;

export const LogUser$ = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullish(),
  })
  .nullish();
export type LogUser = z.infer<typeof LogUser$>;

export const LogWithUser$ = Log$.extend({
  user: LogUser$,
});
export type LogWithUser = z.infer<typeof LogWithUser$>;

export const PaginatedLogs$ = z.object({
  data: Log$.array(),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type PaginatedLogs = z.infer<typeof PaginatedLogs$>;

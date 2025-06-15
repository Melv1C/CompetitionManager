import { z } from 'zod/v4';
import { Boolean$, Date$, Id$ } from './base';

/**
 * Log level enum - matches Winston log levels
 */
export const LogLevel$ = z.enum([
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
]);
export type LogLevel = z.infer<typeof LogLevel$>;

/**
 * Base log schema
 */
export const Log$ = z.object({
  id: Id$,
  level: LogLevel$,
  message: z.string(),
  meta: z.string().nullable(),
  timestamp: Date$,
});
export type Log = z.infer<typeof Log$>;

/**
 * Schema for log query filters
 */
export const LogQuery$ = z.object({
  levels: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // fallback to original string if not JSON
      }
    }
    return val;
  }, LogLevel$.array().default(LogLevel$.options)),
  startDate: Date$.optional(),
  endDate: Date$.optional(),
  limit: z.coerce.number().int().positive().max(1000).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  search: z.string().optional(), // Search in message
});
export type LogQuery = z.infer<typeof LogQuery$>;

/**
 * Schema for paginated log response
 */
export const PaginatedLogsResponse$ = z.object({
  logs: Log$.array(),
  totalCount: z.number().int().nonnegative(),
  hasMore: Boolean$,
  page: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  pageSize: z.number().int().positive(),
});
export type PaginatedLogsResponse = z.infer<typeof PaginatedLogsResponse$>;

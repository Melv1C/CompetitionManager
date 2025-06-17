import { z } from 'zod/v4';

export const Id$ = z.number().int().positive();
export type Id = z.infer<typeof Id$>;

export const ParameterId$ = z.coerce.number().int().positive();
export type ParameterId = z.infer<typeof ParameterId$>;

export const BetterAuthId$ = z
  .string()
  .regex(/^[A-Za-z0-9]{32}$/, 'Invalid Better Auth ID format');
export type BetterAuthId = z.infer<typeof BetterAuthId$>;

export const Cuid$ = z.cuid();
export type Cuid = z.infer<typeof Cuid$>;

// Not use coerce because it can lead to unexpected behavior in react hook forms
export const Date$ = z.union([
  z.date(),
  z.iso.datetime().transform((date) => new Date(date)),
]);
export type Date = z.infer<typeof Date$>;

export const Email$ = z.email();
export type Email = z.infer<typeof Email$>;

export const Boolean$ = z.union([z.boolean(), z.stringbool()]);
export type Boolean = z.infer<typeof Boolean$>;

export const Url$ = z.url();
export type Url = z.infer<typeof Url$>;

export const Gender$ = z.enum(['M', 'F']);
export type Gender = z.infer<typeof Gender$>;

import { z } from 'zod';

export const Id$ = z.string();
export type Id = z.infer<typeof Id$>;

export const Date$ = z.coerce.date();
export type Date = z.infer<typeof Date$>;

export const Email$ = z.string().email();
export type Email = z.infer<typeof Email$>;

export const Boolean$ = z.boolean();
export type Boolean = z.infer<typeof Boolean$>;

export const Url$ = z.string().url();
export type Url = z.infer<typeof Url$>;


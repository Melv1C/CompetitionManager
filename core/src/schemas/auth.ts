import { z } from 'zod/v4';
import { BetterAuthId$, Boolean$, Date$, Email$, Url$ } from './base';

export const UserRole$ = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRole$>;

export const User$ = z.object({
  id: BetterAuthId$,
  name: z.string(),
  email: Email$,
  emailVerified: Boolean$,
  image: Url$.nullish(),
  createdAt: Date$,
  updatedAt: Date$,
  role: UserRole$.default('user'),
  banned: Boolean$.nullish(),
  banReason: z.string().nullish(),
  banExpires: Date$.nullish(),
});
export type User = z.infer<typeof User$>;

export const Session$ = z.object({
  id: BetterAuthId$,
  expiresAt: Date$,
  token: z.string(),
  createdAt: Date$,
  updatedAt: Date$,
  ipAddress: z.string().nullish(),
  userAgent: z.string().nullish(),
  userId: BetterAuthId$,
  impersonatedBy: BetterAuthId$.nullish(),
  activeOrganizationId: BetterAuthId$.nullish(),
});
export type Session = z.infer<typeof Session$>;

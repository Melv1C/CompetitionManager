import { z } from 'zod/v4';
import { BetterAuthId$, Boolean$, Date$, Email$, Url$ } from './base';

export const UserRole$ = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof UserRole$>;

export const User$ = z.object({
  id: BetterAuthId$,
  name: z.string(),
  email: Email$,
  emailVerified: Boolean$,
  image: Url$.nullable(),
  createdAt: Date$,
  updatedAt: Date$,
  role: UserRole$.default('user'),
  banned: Boolean$.nullable(),
  banReason: z.string().nullable(),
  banExpires: Date$.nullable(),
});
export type User = z.infer<typeof User$>;

export const Session$ = z.object({
  id: BetterAuthId$,
  expiresAt: Date$,
  token: z.string(),
  createdAt: Date$,
  updatedAt: Date$,
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: BetterAuthId$,
  impersonatedBy: BetterAuthId$.nullable(),
  activeOrganizationId: BetterAuthId$.nullable(),
});
export type Session = z.infer<typeof Session$>;

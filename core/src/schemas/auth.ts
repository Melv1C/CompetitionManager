import { z } from 'zod';
import { Boolean$, Date$, Email$, Id$, Url$ } from './base';

export const UserRole$ = z.enum(['admin', 'user'] as const);
export type UserRole = z.infer<typeof UserRole$>;

export const User$ = z.object({
  id: Id$,
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
  id: Id$,
  expiresAt: Date$,
  token: z.string(),
  createdAt: Date$,
  updatedAt: Date$,
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  userId: Id$,
  impersonatedBy: Id$.nullable(),
  activeOrganizationId: Id$.nullable(),
});
export type Session = z.infer<typeof Session$>;

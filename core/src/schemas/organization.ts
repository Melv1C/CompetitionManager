import { z } from 'zod';
import { Date$, Id$, Url$ } from './base';

export const Organization$ = z.object({
  id: Id$,
  name: z.string(),
  slug: z.string().nullable(),
  logo: Url$.nullable(),
  createdAt: Date$,
  metadata: z.string().nullable(),
});
export type Organization = z.infer<typeof Organization$>;

export const MemberRole$ = z.enum(['owner', 'admin', 'member'] as const);
export type MemberRole = z.infer<typeof MemberRole$>;

export const Member$ = z.object({
  id: Id$,
  organizationId: Id$,
  userId: Id$,
  role: MemberRole$,
  createdAt: Date$,
});
export type Member = z.infer<typeof Member$>;

export const InvitationStatus$ = z.enum([
  'pending',
  'accepted',
  'declined',
] as const);
export type InvitationStatus = z.infer<typeof InvitationStatus$>;

export const Invitation$ = z.object({
  id: Id$,
  organizationId: Id$,
  email: z.string().email(),
  role: MemberRole$.nullable(),
  status: InvitationStatus$,
  expiresAt: Date$,
  inviterId: Id$,
});
export type Invitation = z.infer<typeof Invitation$>;

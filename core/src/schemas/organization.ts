import { z } from 'zod/v4';
import { BetterAuthId$, Date$, Url$ } from './base';

export const Organization$ = z.object({
  id: BetterAuthId$,
  name: z.string(),
  slug: z.string().nullable(),
  logo: Url$.nullable(),
  createdAt: Date$,
  metadata: z.string().nullable(),
});
export type Organization = z.infer<typeof Organization$>;

export const MemberRole$ = z.enum(['owner', 'admin', 'member']);
export type MemberRole = z.infer<typeof MemberRole$>;

export const Member$ = z.object({
  id: BetterAuthId$,
  organizationId: BetterAuthId$,
  userId: BetterAuthId$,
  role: MemberRole$,
  createdAt: Date$,
});
export type Member = z.infer<typeof Member$>;

export const InvitationStatus$ = z.enum(['pending', 'accepted', 'declined']);
export type InvitationStatus = z.infer<typeof InvitationStatus$>;

export const Invitation$ = z.object({
  id: BetterAuthId$,
  organizationId: BetterAuthId$,
  email: z.string().email(),
  role: MemberRole$.nullable(),
  status: InvitationStatus$,
  expiresAt: Date$,
  inviterId: BetterAuthId$,
});
export type Invitation = z.infer<typeof Invitation$>;

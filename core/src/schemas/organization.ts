import { z } from 'zod/v4';
import { BetterAuthId$, Date$, Email$, Url$ } from './base';

export const Organization$ = z.object({
  id: BetterAuthId$,
  name: z.string(),
  slug: z.string().nullish(),
  logo: Url$.nullish(),
  createdAt: Date$,
  metadata: z.string().nullish(),

  contactEmail: Email$.nullish(),
  contactPhone: z.string().nullish(),
  website: Url$.nullish(),
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
  email: Email$,
  role: MemberRole$.nullish(),
  status: InvitationStatus$,
  expiresAt: Date$,
  inviterId: BetterAuthId$,
});
export type Invitation = z.infer<typeof Invitation$>;

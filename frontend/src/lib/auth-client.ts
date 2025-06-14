import { ac, admin, organizationAc, organizationAdmin, owner, resultManager, user } from '@competition-manager/core/utils';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    organizationClient({
      ac: organizationAc,
      roles: {
        owner,
        organizationAdmin,
        resultManager,
      },
    }),
  ],
});

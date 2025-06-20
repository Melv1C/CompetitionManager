import { ac, admin, owner, resultManager } from '@repo/core/utils';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    adminClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        resultManager,
      },
    }),
  ],
});

import { ac, admin, owner, resultManager } from '@repo/core/utils';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from './env';

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
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

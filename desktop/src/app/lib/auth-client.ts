import { ac, admin, owner, resultManager } from '@repo/core/utils';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { env } from './env';
import type { AccessControl } from 'better-auth/plugins/access';

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [
    adminClient(),
    organizationClient({
      ac: ac as AccessControl,
      roles: {
        owner,
        admin,
        resultManager,
      },
    }),
  ],
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => localStorage.getItem('bearer_token') || '',
    },
  },
});

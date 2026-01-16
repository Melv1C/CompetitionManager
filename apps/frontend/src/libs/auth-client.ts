import { ac, admin, owner, resultManager } from '@repo/utils';
import { adminClient, organizationClient } from 'better-auth/client/plugins';
import type { AccessControl } from 'better-auth/plugins/access';
import { createAuthClient } from 'better-auth/react';
import { env } from './env';

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
  fetchOptions: env.VITE_USE_BEARER
    ? {
        auth: {
          type: 'Bearer',
          token: () => localStorage.getItem('bearer_token') || '',
        },
      }
    : {},
});

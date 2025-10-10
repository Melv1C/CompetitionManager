import { ac, admin, owner, resultManager } from '@repo/core/utils';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin, bearer, organization } from 'better-auth/plugins';
import type { AccessControl } from 'better-auth/plugins/access';
import { env } from './env';
import { prisma } from './prisma';

// Add this helper function to fetch the active organization for a user
async function getActiveOrganization(userId: string) {
  return await prisma.organization.findFirst({
    where: {
      members: {
        some: { userId },
      },
    },
    select: { id: true },
  });
}

async function isAdmin(userId: string) {
  // Adjust the query as needed for your schema
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === 'admin';
}

export const auth = betterAuth({
  baseURL: env.FRONTEND_URL,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [env.DESKTOP_URL],
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: 'string',
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google:
      !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            redirectURI: `${env.BACKEND_URL}/api/auth/callback/google`,

            mapProfileToUser: async profile => {
              const user = await prisma.user.findUnique({
                where: { email: profile.email },
              });

              return {
                email: profile.email,
                name: profile.name,
                avatar: profile.picture,
                // If a user exists:
                //   - If their email is verified, use the profile's email_verified value (may reflect latest status).
                //   - If not verified, set to false.
                // If no user exists, use the profile's email_verified value directly.
                // If the emailVerified is false and the user already exists, the process will fail later
                emailVerified: user
                  ? user.emailVerified
                    ? profile.email_verified
                    : false
                  : profile.email_verified,
              };
            },
          }
        : undefined,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: [],
    },
  },
  plugins: [
    bearer(),
    adminPlugin(),
    organization({
      ac: ac as AccessControl,
      roles: {
        owner,
        admin,
        resultManager,
      },
      allowUserToCreateOrganization: async user => {
        return isAdmin(user.id);
      },
    }),
  ],

  databaseHooks: {
    session: {
      create: {
        before: async session => {
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id || null,
            },
          };
        },
      },
    },
  },
});

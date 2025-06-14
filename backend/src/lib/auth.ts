import {
  ac,
  admin,
  user,
} from '@competition-manager/core/utils';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin, organization } from 'better-auth/plugins';
import { prisma } from './prisma';

// Add this helper function to fetch the active organization for a user
async function getActiveOrganization(userId: string) {
  // Adjust the query as needed for your schema
  return await prisma.organization.findFirst({
    where: {
      members: {
        some: { id: userId },
      },
    },
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
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    organization({
      allowUserToCreateOrganization: async (user) => {
        return isAdmin(user.id);
      },
    }),
  ],

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
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

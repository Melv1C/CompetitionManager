import { ac, admin, owner, resultManager } from '@repo/core/utils';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin, bearer, organization } from 'better-auth/plugins';
import { env } from './env';
import { prisma } from './prisma';
import type { AccessControl } from 'better-auth/plugins/access';


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
  trustedOrigins: [env.DESKTOP_URL],
  emailAndPassword: {
    enabled: true,
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

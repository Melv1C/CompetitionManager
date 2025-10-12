import { render } from '@react-email/components';
import { ac, admin, owner, resultManager } from '@repo/core/utils';
import { betterAuth, logger } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin, bearer, organization } from 'better-auth/plugins';
import type { AccessControl } from 'better-auth/plugins/access';
import ResetPasswordEmail from 'emails/reset-password-email';
import VerifyEmail from 'emails/verify-email';
import { env } from './env';
import { nodemailer } from './nodemailer';
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
    sendResetPassword: async ({ user, token }) => {
      const html = await render(
        ResetPasswordEmail({
          url: `${env.BACKEND_URL}/api/auth/reset-password/${token}?callbackURL=${env.FRONTEND_URL}/reset-password`,
        }),
      );
      await nodemailer.sendMail({
        to: user.email,
        subject: 'Reset your password',
        html,
      });
    },
    onPasswordReset: async ({ user }) => {
      logger.info(`User with email ${user.email} has requested a password reset.`);
    },
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
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const html = await render(
        VerifyEmail({
          url: `${env.BACKEND_URL}/api/auth/verify-email?token=${token}&callbackURL=${env.FRONTEND_URL}`,
        }),
      );
      await nodemailer.sendMail({
        to: user.email,
        subject: 'Verify your email address',
        html,
      });
    },
    async afterEmailVerification(user) {
      logger.info(`User with email ${user.email} has verified their email address.`);
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

import { authClient } from '@/libs/auth-client';
import { User$ } from '@repo/utils';

export const useAuth = () => {
  const { data: session, isPending, error } = authClient.useSession();

  const user = session ? User$.parse(session.user) : null;
  const isAuthenticated = !!user;

  return {
    // User state
    user,
    isAuthenticated,
    isPending,
    error,

    // Session data
    session,
  };
};

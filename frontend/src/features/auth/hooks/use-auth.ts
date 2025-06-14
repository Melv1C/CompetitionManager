import { authClient } from '@/lib/auth-client';
import { User$ } from '@competition-manager/core/schemas';

export const useAuth = () => {
  const { data: session, isPending, error } = authClient.useSession();

  const user = session ? User$.parse(session.user) : null;
  const isAuthenticated = !!user;
  const isLoading = isPending;

  return {
    // User state
    user,
    isAuthenticated,
    isLoading,
    error,

    // Session data
    session,
  };
};

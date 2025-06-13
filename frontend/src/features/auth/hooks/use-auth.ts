import { useSession } from '@/lib/auth-client';

export const useAuth = () => {
  const { data: session, isPending, error } = useSession();

  const user = session?.user || null;
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

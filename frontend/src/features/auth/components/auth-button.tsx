import { useAuth } from '@/features/auth/hooks/use-auth';
import { AuthSkeleton } from './auth-skeleton';
import { LoginButton } from './login-button';
import { UserButton } from './user-button';

interface AuthButtonProps {
  isMobile?: boolean;
  onMobileMenuClose?: () => void;
}

export function AuthButton({
  isMobile = false,
  onMobileMenuClose,
}: AuthButtonProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <AuthSkeleton isMobile={isMobile} />;
  }

  if (!user) {
    return (
      <LoginButton isMobile={isMobile} onMobileMenuClose={onMobileMenuClose} />
    );
  }

  return <UserButton user={user} onMobileMenuClose={onMobileMenuClose} />;
}

import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth';
import { UserButton } from './user-button';

export function AuthButton() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) {
    return null;
  }

  return <UserButton user={user} />;
}

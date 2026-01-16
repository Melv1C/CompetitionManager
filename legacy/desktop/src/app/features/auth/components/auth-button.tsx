import { Skeleton } from '@repo/ui';
import { useAuth } from '@/features/auth';
import { UserButton } from './user-button';

export function AuthButton() {
  const { user, isPending } = useAuth();

  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) {
    return null;
  }

  return <UserButton user={user} />;
}

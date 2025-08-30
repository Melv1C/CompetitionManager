import { Skeleton } from '@/components/ui/skeleton';

interface AuthSkeletonProps {
  isMobile?: boolean;
}

export function AuthSkeleton({ isMobile = false }: AuthSkeletonProps) {
  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  return <Skeleton className="h-10 w-20" />;
}

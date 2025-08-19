import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CompetitionCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-muted rounded-md w-3/4 animate-pulse" />
          </div>
          <div className="h-6 w-16 bg-muted rounded-md animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Date skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>

        {/* Location skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
        </div>

        {/* Events count skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full animate-pulse" />
          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
        </div>

        {/* Badges skeleton */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
          <div className="h-5 w-14 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

interface CompetitionsSkeletonProps {
  count?: number;
}

export function CompetitionsSkeleton({ count = 6 }: CompetitionsSkeletonProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CompetitionCardSkeleton key={i} />
      ))}
    </div>
  );
}

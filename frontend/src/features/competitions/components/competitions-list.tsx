import { Link } from 'react-router-dom';
import type { Competition } from '@repo/core/schemas';

interface CompetitionsListProps {
  competitions: Competition[];
  isLoading?: boolean;
}

export function CompetitionsList({ competitions, isLoading }: CompetitionsListProps) {
  if (isLoading) {
    return <div className="py-4 text-center">Loading competitions...</div>;
  }

  if (competitions.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No competitions found
      </div>
    );
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map((comp) => (
        <Link
          key={comp.id}
          to={`/competitions/${comp.eid}`}
          className="rounded-lg border p-4 hover:bg-muted/50"
        >
          <h3 className="font-semibold">{comp.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(comp.startDate)} &bull; {comp.organization.name}
          </p>
        </Link>
      ))}
    </div>
  );
}

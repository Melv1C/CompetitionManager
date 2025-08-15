import { Link } from 'react-router-dom';
import type { Competition } from '@repo/core/schemas';
import { formatDateShort } from '@/lib/formatters';

interface CompetitionsListProps {
  competitions: Competition[];
}

export function CompetitionsList({ competitions }: CompetitionsListProps) {
  if (competitions.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No competitions found</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {competitions.map(comp => (
        <Link
          key={comp.id}
          to={`/competitions/${comp.eid}`}
          className="rounded-lg border p-4 hover:bg-muted/50"
        >
          <h3 className="font-semibold">{comp.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatDateShort(comp.startDate)} &bull; {comp.organization.name}
          </p>
        </Link>
      ))}
    </div>
  );
}

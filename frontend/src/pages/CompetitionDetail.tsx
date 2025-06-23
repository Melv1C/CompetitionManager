import { useCompetition } from '@/features/competitions';
import { useParams } from 'react-router-dom';

export function CompetitionDetailPage() {
  const { eid } = useParams<{ eid: string }>();
  const { data: competition, isLoading } = useCompetition(eid);

  if (isLoading) {
    return <div className="py-4 text-center">Loading competition...</div>;
  }

  if (!competition) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Competition not found
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{competition.name}</h1>
        <p className="text-muted-foreground">
          {formatDate(competition.startDate)} • {competition.organization.name}
        </p>
      </div>
      {competition.description && <p>{competition.description}</p>}
    </div>
  );
}

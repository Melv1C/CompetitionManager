import { CompetitionsList, useCompetitions } from '@/features/competitions';

export function CompetitionsPage() {
  const competitions = useCompetitions({
    upcoming: true,
    past: false,
  });

  if (competitions.isPending) {
    return <div className="text-center py-4">Loading competitions...</div>;
  }

  if (competitions.isError) {
    return <div className="text-center py-4">Failed to load competitions</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <p className="text-muted-foreground">Upcoming competitions calendar.</p>
      </div>
      <CompetitionsList competitions={competitions.data} />
    </div>
  );
}

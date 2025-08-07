import { CompetitionsList, useCompetitions } from '@/features/competitions';

export function ResultsPage() {
  const competitions = useCompetitions({
    upcoming: false,
    past: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <p className="text-muted-foreground">Past competitions and results.</p>
      </div>
      <CompetitionsList competitions={competitions.data} />
    </div>
  );
}

import { CompetitionsList, useCompetitions } from '@/features/competitions';

export function CompetitionsPage() {
  const { data: competitions = [], isLoading } = useCompetitions({
    upcoming: true,
    past: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
        <p className="text-muted-foreground">Upcoming competitions calendar.</p>
      </div>
      <CompetitionsList competitions={competitions} isLoading={isLoading} />
    </div>
  );
}

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
    <div className="space-y-6 mx-auto max-w-4xl">
      <CompetitionsList competitions={competitions.data} />
    </div>
  );
}

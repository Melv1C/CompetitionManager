import { useCompetitions, CompetitionsList } from '@/features/competitions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/results')({
  component: RouteComponent,
});

function RouteComponent() {
  const competitions = useCompetitions({
    upcoming: false,
    past: true,
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

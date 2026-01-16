import { useRequiredOrganizationCompetition } from '@/features/competitions';
import {
  OrganizationInscriptionsTable,
  useOrganizationInscriptions,
} from '@/features/inscriptions';
import { Skeleton } from '@repo/ui';
import { useParams } from 'react-router-dom';

export function CompetitionInscriptions() {
  const { competitionEid } = useParams<{ competitionEid: string }>();
  if (!competitionEid) {
    throw new Error('Competition EID is required');
  }

  const competition = useRequiredOrganizationCompetition(competitionEid);
  const inscriptions = useOrganizationInscriptions(competitionEid);

  if (inscriptions.isError) {
    throw new Error('Failed to load inscriptions');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
        <p className="text-muted-foreground">Manage registrations for the competition.</p>
      </div>

      {inscriptions.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <OrganizationInscriptionsTable
          inscriptions={inscriptions.data}
          competitionStartDate={competition.startDate}
        />
      )}
    </div>
  );
}

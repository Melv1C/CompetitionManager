import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useCompetitionStore } from '@/store/competition';
import { useOrganizationCompetition } from '@/features/competitions';

export function CompetitionOutlet() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { currentCompetition, setCompetition } = useCompetitionStore();

  const { data } = useOrganizationCompetition(competitionId!);

  useEffect(() => {
    if (data && (!currentCompetition || currentCompetition.id !== data.id)) {
      setCompetition(data);
    }
  }, [data, currentCompetition, setCompetition]);

  return <Outlet />;
}

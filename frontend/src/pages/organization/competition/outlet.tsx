import { useOrganizationCompetition } from '@/features/competitions';
import { useOrganizationCompetitionStore } from '@/store/organization-competition';
import type { Cuid } from '@repo/core/schemas';
import { useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';

export function CompetitionOutlet() {
  const { competitionEid } = useParams<{ competitionEid: Cuid }>();
  const { currentCompetition, setCompetition } = useOrganizationCompetitionStore();

  const { data } = useOrganizationCompetition(competitionEid!);

  // If the competitionEid is not in the URL, clear the current competition

  useEffect(() => {
    if (data && (!currentCompetition || currentCompetition.updatedAt !== data.updatedAt)) {
      setCompetition(data);
    }
  }, [data, currentCompetition, setCompetition]);

  return <Outlet />;
}

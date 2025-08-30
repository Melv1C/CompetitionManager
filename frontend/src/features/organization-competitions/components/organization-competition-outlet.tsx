import { useOrganizationCompetition } from '@/features/competitions';
import { useOrganizationCompetitionStore } from '@/features/organization-competitions/store/organization-competition';
import { useCompetitionEid } from '@/hooks';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export function OrganizationCompetitionOutlet() {
  const competitionEid = useCompetitionEid();
  const { currentCompetition, setCompetition } = useOrganizationCompetitionStore();

  const { data } = useOrganizationCompetition(competitionEid);

  // If the competitionEid is not in the URL, clear the current competition

  useEffect(() => {
    if (
      data &&
      (!currentCompetition ||
        currentCompetition.id !== data.id ||
        currentCompetition.updatedAt !== data.updatedAt)
    ) {
      setCompetition(data);
    }
  }, [data, currentCompetition, setCompetition]);

  return <Outlet />;
}

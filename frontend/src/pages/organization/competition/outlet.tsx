import { useOrganizationCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import { useOrganizationCompetitionStore } from '@/store/organization-competition';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export function CompetitionOutlet() {
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

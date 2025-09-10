import { useOrganizationCompetition } from '@/features/competitions';
import { useOrganizationCompetitionStore } from '@/features/organization-competitions/store/organization-competition';
import { useCompetitionEid } from '@/hooks';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export function OrganizationCompetitionOutlet() {
  const competitionEid = useCompetitionEid();
  const { currentCompetition, setCompetition } = useOrganizationCompetitionStore();

  const organizationCompetition = useOrganizationCompetition(competitionEid);

  if (organizationCompetition.isError) {
    throw new Error('Failed to load organization competition');
  }

  useEffect(() => {
    if (
      organizationCompetition.data &&
      (!currentCompetition ||
        currentCompetition.id !== organizationCompetition.data.id ||
        currentCompetition.updatedAt !== organizationCompetition.data.updatedAt)
    ) {
      setCompetition(organizationCompetition.data);
    }
  }, [organizationCompetition, currentCompetition, setCompetition]);

  if (organizationCompetition.isPending) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
}

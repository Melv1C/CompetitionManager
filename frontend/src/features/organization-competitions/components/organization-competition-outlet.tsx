import { useOrganizationCompetition } from '@/features/competitions';
import { useOrganizationInscriptions } from '@/features/inscriptions';
import { useOrganizationCompetitionStore } from '@/features/organization-competitions/store/organization-competition';
import { useLiveResult, useOrganizationResults } from '@/features/results';
import { useCompetitionEid } from '@/hooks';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

export function OrganizationCompetitionOutlet() {
  const competitionEid = useCompetitionEid();
  const { currentCompetition, setCompetition } = useOrganizationCompetitionStore();

  const organizationCompetition = useOrganizationCompetition(competitionEid);
  const inscription = useOrganizationInscriptions(competitionEid);
  const results = useOrganizationResults(competitionEid);

  const isPending = organizationCompetition.isPending || inscription.isPending || results.isPending;
  const isError = organizationCompetition.isError || inscription.isError || results.isError;
  const error = organizationCompetition.error || inscription.error || results.error;

  if (isError) {
    throw new Error('Failed to load organization competition' + (error ? ': ' + error : ''));
  }

  useLiveResult(competitionEid);

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

  if (isPending) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
}

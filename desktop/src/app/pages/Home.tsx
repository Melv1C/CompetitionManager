import { useOrganizationCompetition } from '@/features/competitions';
import { useCompetitionStore } from '@/store/competition';
import { useEffect } from 'react';

export default function Home() {
  const competitionEid = useCompetitionStore(state => state.competitionEid);
  const competitionQuery = useOrganizationCompetition(competitionEid!);

  useEffect(() => {
    if (competitionQuery.data) {
      window.electron.importCompetition(competitionQuery.data);
    }
  }, [competitionQuery.data]);

  useEffect(() => {
    window.electron.exportCompetition().then(competition => {
      console.log('Exported competition:', competition);
    });
  }, []);

  if (competitionQuery.isError) {
    return <div>Error loading competition</div>;
  }
  if (competitionQuery.isPending) {
    return <div>Loading competition...</div>;
  }
  return <h1>{competitionQuery.data.name}</h1>;
}

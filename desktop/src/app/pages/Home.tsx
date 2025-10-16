import { Button } from '@/components/ui/button';
import { useOrganizationCompetition } from '@/features/competitions';
import { useCompetitionInscriptions } from '@/features/inscriptions/hooks/use-inscriptions';
import { useCompetitionStore } from '@/store/competition';
import { useEffect, useState } from 'react';

export default function Home() {
  const competitionEid = useCompetitionStore(state => state.competitionEid);
  const competitionQuery = useOrganizationCompetition(competitionEid!);
  const inscriptionsQuery = useCompetitionInscriptions(competitionEid!);
  const [competitionExist, setCompetitionExist] = useState<boolean | null>(null);
  const [existingAMEvents, setExistingAMEvents] = useState<string[]>([]);

  // useEffect(() => {
  //   if (competitionQuery.data) {
  //     window.electron.importCompetition(competitionQuery.data);
  //   }
  // }, [competitionQuery.data]);

  // useEffect(() => {
  //   if (inscriptionsQuery.data && competitionQuery.data) {
  //     window.electron.importAthletes(
  //       inscriptionsQuery.data,
  //       competitionQuery.data.id,
  //       competitionQuery.data.startDate,
  //     );
  //   }
  // }, [inscriptionsQuery.data, competitionQuery.data]);

  useEffect(() => {
    window.electron.exportCompetition().then(competition => {
      console.log('Exported competition:', competition);
    });
  }, []);

  useEffect(() => {
    const getStatus = async () => {
      if (competitionQuery.data) {
        const { competitionExist, events } = await window.electron.getStatus(competitionQuery.data);
        setCompetitionExist(competitionExist);
        setExistingAMEvents(events);
      }
    };
    getStatus();
  }, [competitionQuery.data]);

  if (competitionQuery.isError || inscriptionsQuery.isError) {
    return <div>Error loading competition</div>;
  }
  if (competitionQuery.isPending || inscriptionsQuery.isPending) {
    return <div>Loading competition...</div>;
  }
  return (
    <>
      <div>Competition: {competitionQuery.data?.name}</div>
      <div>Existing AM Events:</div>
      {existingAMEvents.map(event => (<div key={event}>{event}</div>))}

      {competitionExist === null ? (
        <div>Checking competition status...</div>
      ) : competitionExist ? (
        <Button
          onClick={() => {
            window.electron.importCompetition(competitionQuery.data, true);
          }}
        >
          Reimport competition
        </Button>
      ) : (
        <Button
          onClick={() => {
            window.electron.importCompetition(competitionQuery.data);
          }}
        >
          Import competition
        </Button>
      )}
      <Button
        onClick={() => {
          window.electron.importAthletes(
            inscriptionsQuery.data!,
            competitionQuery.data!.id,
            competitionQuery.data!.startDate,
          );
        }}
      >
        Import Athlete
      </Button>
    </>
  );
}

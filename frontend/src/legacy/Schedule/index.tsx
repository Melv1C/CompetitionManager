import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useOrganizationCompetition } from '@/features/competitions';
import { type CompetitionEvent } from '@repo/core/schemas';

export const Schedule = () => {
  const { t } = useTranslation();

  const { competitionEid } = useParams<{ competitionEid: string }>();
  if (!competitionEid) {
    throw new Error('Competition EID is required');
  }
  const competition = useOrganizationCompetition(competitionEid);

  const events = useMemo(() => {
    if (competition.isLoading || !competition.data) {
      return [];
    }
    return competition.data.events
      .filter((e) => !e.parentId)
      .sort(
        (a, b) =>
          new Date(a.eventStartTime).getTime() -
          new Date(b.eventStartTime).getTime()
      );
  }, [competition.isLoading, competition.data]);
  const columns: GridColDef[] = [
    {
      field: 'schedule',
      headerName: t('labels:schedule'),
      width: 100,
      valueFormatter: (value: Date) => {
        if (competition.data?.endDate) {
          return (
            value.toLocaleDateString('fr') +
            ' ' +
            value.toLocaleTimeString('fr', {
              hour: '2-digit',
              minute: '2-digit',
            })
          );
        }
        return value.toLocaleTimeString('fr', {
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    { field: 'name', headerName: t('labels:name'), width: 150 },
    // {
    //   field: "inscriptions",
    //   headerName: t("glossary:inscriptions"),
    //   width: 100,
    //   align: "center",
    //   valueGetter: (_, row) => {
    //     const inscriptionsCount = inscriptions.filter(
    //       (i) => i.competitionEvent.id === row.id
    //     ).length;
    //     return inscriptionsCount;
    //   },
    //   renderCell: (params) => (
    //     <ShowUsersNumber value={params.value as number} />
    //   ),
    // },
    {
      field: 'place',
      headerName: t('glossary:place'),
      width: 100,
      valueFormatter: (value: CompetitionEvent['maxParticipants']) => {
        if (!value) return '-';
        return value;
      },
    },
    {
      field: 'cost',
      headerName: t('glossary:price'),
      width: 100,
      valueFormatter: (value: number) => {
        if (value === 0) return t('glossary:free');
        return value + '€';
      },
    },
    // {
    //   field: "actions",
    //   headerName: t("labels:actions"),
    //   width: 150,
    //   renderCell: (params) => (
    //     <Box>
    //       <CircleButton
    //         size="2rem"
    //         color="primary"
    //         onClick={() => {
    //           setSelectedEvent(CompetitionEvent$.parse(params.row));
    //           setSelectedChildren(
    //             competition.events.filter((e) => e.parentId === params.row.id)
    //           );
    //           setIsEventPopupVisible(true);
    //         }}
    //       >
    //         <Icons.Edit />
    //       </CircleButton>
    //       <CircleButton
    //         size="2rem"
    //         color="error"
    //         onClick={() => console.log("delete", params.row.id)}
    //       >
    //         <Icons.Delete />
    //       </CircleButton>
    //     </Box>
    //   ),
    // },
  ];

  if (competition.isLoading) {
    return <div>Loading...</div>;
  }

  if (competition.isError) {
    return <div>Error loading competition</div>;
  }

  if (!competition.data) {
    return <div>No competition data available</div>;
  }

  return (
    <div className="space-y-6">
      <DataGrid columns={columns} rows={events} />
    </div>
  );
};

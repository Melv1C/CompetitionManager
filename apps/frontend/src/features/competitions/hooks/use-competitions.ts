import { apiClient } from '@/libs/api-client';
import { Competition$, CompetitionQuery, Cuid } from '@repo/utils';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const COMPETITIONS_QUERY_KEY = 'competitions';

export function useCompetitions(query: Partial<CompetitionQuery>) {
  return useQuery({
    queryKey: [COMPETITIONS_QUERY_KEY, query],
    queryFn: () => Competition$.array().parse(apiClient.api.competitions.$get({ query })),
  });
}

export function useCompetition(eid: Cuid) {
  return useQuery({
    queryKey: [COMPETITIONS_QUERY_KEY, 'detail', eid],
    queryFn: () => Competition$.parse(apiClient.api.competitions[':eid'].$get({ param: { eid } })),
  });
}

export function useRequiredCompetition(eid: Cuid) {
  const { t } = useTranslation();
  const competition = useCompetition(eid);

  if (competition.isPending) {
    throw new Error(t('messages:loading.competition'));
  }

  if (competition.isError) {
    throw new Error(t('messages:error.competition'));
  }

  return competition.data;
}

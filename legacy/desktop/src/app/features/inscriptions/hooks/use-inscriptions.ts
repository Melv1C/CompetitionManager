import { InscriptionsService } from '../services/inscriptions-service';
import type { Cuid } from '@repo/core/schemas';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const INSCRIPTIONS_QUERY_KEY = 'inscriptions';

export function useCompetitionInscriptions(competitionEid: Cuid) {
  return useQuery({
    queryKey: [INSCRIPTIONS_QUERY_KEY, competitionEid],
    queryFn: () => InscriptionsService.getCompetitionInscriptions(competitionEid),
  });
}

export function useRequiredCompetitionInscriptions(eid: Cuid) {
  const { t } = useTranslation();
  const inscriptions = useCompetitionInscriptions(eid);

  if (inscriptions.isPending) {
    throw new Error(t('loading.competition'));
  }

  if (inscriptions.isError) {
    throw new Error(t('error.competition'));
  }

  return inscriptions.data;
}

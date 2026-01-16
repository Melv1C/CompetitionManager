import { ACTIVE_ORGANIZATION_QUERY_KEY, RESULTS_QUERY_KEY } from '@/lib/query-keys';
import { ResultsService } from '@/services';
import type { CreateResult, Cuid, UpdateResult } from '@repo/core/schemas';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'node_modules/react-i18next';
import { toast } from 'sonner';

export const useOrganizationResults = (competitionEid: Cuid) => {
  return useQuery({
    queryKey: [RESULTS_QUERY_KEY, ACTIVE_ORGANIZATION_QUERY_KEY, competitionEid],
    queryFn: () => ResultsService.getOrganizationResults(competitionEid),
  });
};

/**
 * Hook to create a new result
 */
export function useCreateResult(competitionEid: Cuid) {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateResult) => ResultsService.createResult(competitionEid, data),
    onSuccess: () => {
      // Don't need to invalidate because we have real-time updates via socket
      toast.success(t('messages:success.result_created'));
    },
    onError: error => {
      console.error('Error creating result:', error);
      toast.error(t('messages:error.result_create_failed'));
    },
  });
}

/**
 * Hook to update an existing result
 */
export function useUpdateResult(competitionEid: Cuid) {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ resultEid, data }: { resultEid: Cuid; data: UpdateResult }) =>
      ResultsService.updateResult(competitionEid, resultEid, data),
    onSuccess: () => {
      // Don't need to invalidate because we have real-time updates via socket
      toast.success(t('messages:success.result_updated'));
    },
    onError: error => {
      console.error('Error updating result:', error);
      toast.error(t('messages:error.result_update_failed'));
    },
  });
}

/**
 * Hook to delete a result
 */
export function useDeleteResult(competitionEid: Cuid) {
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (resultEid: Cuid) => ResultsService.deleteResult(competitionEid, resultEid),
    onSuccess: () => {
      // Don't need to invalidate because we have real-time updates via socket
      toast.success(t('messages:success.result_deleted'));
    },
    onError: error => {
      console.error('Error deleting result:', error);
      toast.error(t('messages:error.result_delete_failed'));
    },
  });
}

import {
  CHECKOUT_SESSIONS_QUERY_KEY,
  ACTIVE_USER_QUERY_KEY,
  INSCRIPTIONS_QUERY_KEY,
} from '@/lib/query-keys';
import { CheckoutSessionsService } from '@/services/checkout-sessions-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCheckoutSessions() {
  return useQuery({
    queryKey: [CHECKOUT_SESSIONS_QUERY_KEY, ACTIVE_USER_QUERY_KEY],
    queryFn: CheckoutSessionsService.getOpenCheckoutSessions,
    staleTime: 1000 * 10, // 10 seconds
  });
}

export function useExpireCheckoutSession(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => CheckoutSessionsService.expireCheckoutSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHECKOUT_SESSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INSCRIPTIONS_QUERY_KEY] });
    },
  });
}

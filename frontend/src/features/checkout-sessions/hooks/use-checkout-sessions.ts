import { CheckoutSessionsService } from '@/services/checkout-sessions-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const CHECKOUT_SESSIONS_QUERY_KEY = 'checkout-sessions';

export function useCheckoutSessions() {
  return useQuery({
    queryKey: [CHECKOUT_SESSIONS_QUERY_KEY],
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
    },
  });
}

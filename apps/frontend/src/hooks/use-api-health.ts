import { apiClient } from '@/libs/api-client';
import { useQuery } from '@tanstack/react-query';

export function useAPIHealth() {
  return useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const res = await apiClient.api.health.$get();
      if (res.ok) {
        return await res.json();
      }
    },
  });
}

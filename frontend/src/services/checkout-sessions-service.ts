import { apiClient } from '@/lib/api-client';
import { CheckoutSession$ } from '@repo/core/schemas';

export class CheckoutSessionsService {
  static async getOpenCheckoutSessions() {
    const response = await apiClient.get(`/api/users/me/checkout-sessions`);
    return CheckoutSession$.array().parse(response.data);
  }

  static async expireCheckoutSession(sessionId: string) {
    const response = await apiClient.delete(`/api/users/me/checkout-sessions/${sessionId}`);
    return response.data.success as boolean;
  }
}

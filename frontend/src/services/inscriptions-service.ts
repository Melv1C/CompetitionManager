import { apiClient } from '@/lib/api-client';
import type { Cuid, Id, UpsertInscriptions } from '@repo/core/schemas';
import { AlreadyPaidResponse$, Inscription$, InscriptionPublic$ } from '@repo/core/schemas';

type CreateInscriptionsResponse =
  | {
      type: 'inscription';
    }
  | {
      type: 'payment';
      url: string;
    };

export class InscriptionsService {
  static async getInscriptions(competitionEid: string) {
    const response = await apiClient.get(`/api/competitions/${competitionEid}/inscriptions`);
    return InscriptionPublic$.array().parse(response.data);
  }

  static async getOrganizationInscriptions(competitionEid: Cuid) {
    const response = await apiClient.get(
      `/api/organization/competitions/${competitionEid}/inscriptions`,
    );
    return Inscription$.array().parse(response.data);
  }

  static async createInscriptions(
    competitionEid: Cuid,
    inscriptions: UpsertInscriptions,
  ): Promise<CreateInscriptionsResponse> {
    const response = await apiClient.post(
      `/api/competitions/${competitionEid}/inscriptions`,
      inscriptions,
      {
        validateStatus: status => status < 400,
      },
    );

    if (response.status === 201) {
      return { type: 'inscription' };
    }
    if (response.status === 303) {
      return { type: 'payment', url: response.data.url };
    }

    throw new Error('Unexpected response from server');
  }

  static async getUserInscriptions() {
    const response = await apiClient.get(`/api/users/me/inscriptions`);
    return Inscription$.array().parse(response.data);
  }

  static async getAlreadyPaidAmounts(competitionId: Id, athleteIds: Id[]) {
    if (athleteIds.length === 0) {
      return AlreadyPaidResponse$.parse({ perAthlete: {}, total: 0 });
    }
    const response = await apiClient.get(`/api/users/me/already-paid`, {
      params: {
        competitionId,
        athleteIds: athleteIds.map(id => id.toString()).join(','),
      },
    });
    return AlreadyPaidResponse$.parse(response.data);
  }
}

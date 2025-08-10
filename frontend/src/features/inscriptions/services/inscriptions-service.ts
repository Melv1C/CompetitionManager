import { apiClient } from '@/lib/api-client';
import type { Cuid, UpsertInscriptions } from '@repo/core/schemas';
import { InscriptionPublic$ } from '@repo/core/schemas';

export class InscriptionsService {
  static async getCompetitionInscriptions(competitionEid: string) {
    const response = await apiClient.get(
      `/api/competitions/${competitionEid}/inscriptions`
    );
    return InscriptionPublic$.array().parse(response.data);
  }

  static async createInscriptions(
    competitionEid: Cuid,
    inscriptions: UpsertInscriptions
  ) {
    const response = await apiClient.post(
      `/api/competitions/${competitionEid}/inscriptions`,
      inscriptions
    );
    return response.data;
  }
}

import { apiClient } from '@/lib/api-client';
import type { CompetitionCreate } from '@repo/core/schemas';
import { Competition$ } from '@repo/core/schemas';

export class CompetitionsService {
  static async getCompetitions() {
    const response = await apiClient.get('/api/competitions');
    return Competition$.array().parse(response.data);
  }

  static async getOrganizationCompetitions() {
    const response = await apiClient.get('/api/organization/competitions');
    return Competition$.array().parse(response.data);
  }

  static async createCompetition(data: CompetitionCreate) {
    const response = await apiClient.post(
      '/api/organization/competitions',
      data
    );
    return Competition$.parse(response.data);
  }
}

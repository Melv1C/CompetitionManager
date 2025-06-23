import { apiClient } from '@/lib/api-client';
import type {
  CompetitionCreate,
  CompetitionUpdate,
  CompetitionQuery,
  Cuid,
} from '@repo/core/schemas';
import { Competition$ } from '@repo/core/schemas';

export class CompetitionsService {
  static async getCompetitions(query?: Partial<CompetitionQuery>) {
    const response = await apiClient.get('/api/competitions', {
      params: query,
    });
    return Competition$.array().parse(response.data);
  }

  static async getCompetition(eid: string) {
    const response = await apiClient.get(`/api/competitions/${eid}`);
    return Competition$.parse(response.data);
  }

  static async getOrganizationCompetitions() {
    const response = await apiClient.get('/api/organization/competitions');
    return Competition$.array().parse(response.data);
  }

  static async getOrganizationCompetition(eid: Cuid) {
    const response = await apiClient.get(
      `/api/organization/competitions/${eid}`
    );
    return Competition$.parse(response.data);
  }

  static async createCompetition(data: CompetitionCreate) {
    const response = await apiClient.post(
      '/api/organization/competitions',
      data
    );
    return Competition$.parse(response.data);
  }

  static async updateOrganizationCompetition(
    eid: Cuid,
    data: CompetitionUpdate
  ) {
    const response = await apiClient.put(
      `/api/organization/competitions/${eid}`,
      data
    );
    return Competition$.parse(response.data);
  }
}

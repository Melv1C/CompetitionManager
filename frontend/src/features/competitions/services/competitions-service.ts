import { apiClient } from '@/lib/api-client';
import type { Competition, CompetitionCreate } from '@competition-manager/core/schemas';
import { Competition$ } from '@competition-manager/core/schemas';

export class CompetitionsService {
  static async getCompetitions(): Promise<Competition[]> {
    const response = await apiClient.get('/api/competitions');
    return Competition$.array().parse(response.data);
  }

  static async getOrganizationCompetitions(): Promise<Competition[]> {
    const response = await apiClient.get('/api/organization/competitions');
    return Competition$.array().parse(response.data);
  }

  static async createCompetition(data: CompetitionCreate): Promise<Competition> {
    const response = await apiClient.post('/api/organization/competitions', data);
    return Competition$.parse(response.data);
  }
}

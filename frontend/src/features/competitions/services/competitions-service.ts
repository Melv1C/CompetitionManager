import { apiClient } from '@/lib/api-client';
import type { Competition, CompetitionCreate } from '@competition-manager/core/schemas';
import { Competition$ } from '@competition-manager/core/schemas';

export class CompetitionsService {
  static async createCompetition(data: CompetitionCreate): Promise<Competition> {
    const response = await apiClient.post('/api/competitions', data);
    return Competition$.parse(response.data);
  }
}

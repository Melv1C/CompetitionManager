import { apiClient } from '@/lib/api-client';
import type { Athlete, AthleteKey } from '@repo/core/schemas';
import { Athlete$ } from '@repo/core/schemas';

export class AthletesService {
  static async searchAthletes(key: AthleteKey): Promise<Athlete[]> {
    const response = await apiClient.get('/api/athletes', {
      params: { key },
    });
    return Athlete$.array().parse(response.data);
  }
}

import { apiClient } from '@/lib/api-client';
import type { Athlete, AthleteBestPerformancesResponse, AthleteKey } from '@repo/core/schemas';
import { Athlete$, AthleteBestPerformancesResponse$ } from '@repo/core/schemas';

export class AthletesService {
  static async searchAthletes(key: AthleteKey): Promise<Athlete[]> {
    const response = await apiClient.get('/api/athletes', {
      params: { key },
    });
    return Athlete$.array().parse(response.data);
  }

  static async getBestPerformances(
    license: string,
    options?: { fromDate?: string; forceRefresh?: boolean },
  ): Promise<AthleteBestPerformancesResponse> {
    const response = await apiClient.get(`/api/athletes/${license}/best-performances`, {
      params: {
        fromDate: options?.fromDate,
        forceRefresh: options?.forceRefresh,
      },
    });
    return AthleteBestPerformancesResponse$.parse(response.data);
  }
}

import { apiClient } from '@/lib/api-client';
import type { CreateResult, Cuid, Result, UpdateResult } from '@repo/core/schemas';
import { Result$ } from '@repo/core/schemas';

export class ResultsService {
  /**
   * Get all results for a competition (public route)
   */
  static async getCompetitionResults(competitionEid: Cuid): Promise<Result[]> {
    const response = await apiClient.get(`/api/competitions/${competitionEid}/results`);
    return Result$.array().parse(response.data);
  }

  /**
   * Create multiple results (organization route)
   */
  static async createResults(competitionEid: Cuid, results: CreateResult[]): Promise<void> {
    await apiClient.post(`/api/organization/competitions/${competitionEid}/results`, results);
  }

  /**
   * Create a single result (convenience wrapper)
   */
  static async createResult(competitionEid: Cuid, data: CreateResult): Promise<void> {
    await this.createResults(competitionEid, [data]);
  }

  /**
   * Update an existing result (organization route)
   */
  static async updateResult(
    competitionEid: Cuid,
    resultEid: Cuid,
    data: UpdateResult,
  ): Promise<void> {
    await apiClient.put(
      `/api/organization/competitions/${competitionEid}/results/${resultEid}`,
      data,
    );
  }

  /**
   * Delete a result (organization route)
   */
  static async deleteResult(competitionEid: Cuid, resultEid: Cuid): Promise<void> {
    await apiClient.delete(`/api/organization/competitions/${competitionEid}/results/${resultEid}`);
  }
}

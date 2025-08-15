import { apiClient } from '@/lib/api-client';
import type { CompetitionEventCreate, CompetitionEventUpdate, Cuid } from '@repo/core/schemas';
import { CompetitionEvent$ } from '@repo/core/schemas';

export class CompetitionEventsService {
  static async createCompetitionEvent(competitionEid: Cuid, data: CompetitionEventCreate) {
    const response = await apiClient.post(
      `/api/organization/competitions/${competitionEid}/events`,
      data,
    );
    return CompetitionEvent$.parse(response.data);
  }

  static async updateCompetitionEvent(
    competitionEid: Cuid,
    eventEid: Cuid,
    data: CompetitionEventUpdate,
  ) {
    const response = await apiClient.put(
      `/api/organization/competitions/${competitionEid}/events/${eventEid}`,
      data,
    );
    return CompetitionEvent$.parse(response.data);
  }

  static async deleteCompetitionEvent(competitionEid: Cuid, eventEid: Cuid) {
    const response = await apiClient.delete(
      `/api/organization/competitions/${competitionEid}/events/${eventEid}`,
    );
    return response.data;
  }
}

import { apiClient } from '@/lib/api-client'
import type { CompetitionUpdate, Cuid } from '@repo/core/schemas'
import { Competition$ } from '@repo/core/schemas'

export class CompetitionsService {
  static async getOrganizationCompetitions() {
    const response = await apiClient.get('/api/organization/competitions')
    return Competition$.array().parse(response.data)
  }

  static async getOrganizationCompetition(eid: Cuid) {
    const response = await apiClient.get(`/api/organization/competitions/${eid}`)
    return Competition$.parse(response.data)
  }

  static async updateOrganizationCompetition(eid: Cuid, data: CompetitionUpdate) {
    const response = await apiClient.put(`/api/organization/competitions/${eid}`, data)
    return Competition$.parse(response.data)
  }
}

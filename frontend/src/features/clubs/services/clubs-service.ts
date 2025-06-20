import { apiClient } from '@/lib/api-client';
import type { Club, ClubCreate, ClubUpdate } from '@repo/core/schemas';
import { Club$ } from '@repo/core/schemas';

export class ClubsService {
  static async getClubs(): Promise<Club[]> {
    const response = await apiClient.get('/api/clubs');
    return Club$.array().parse(response.data);
  }

  static async getClub(id: number): Promise<Club> {
    const response = await apiClient.get(`/api/clubs/${id}`);
    return Club$.parse(response.data);
  }

  static async createClub(data: ClubCreate): Promise<Club> {
    const response = await apiClient.post('/api/clubs', data);
    return Club$.parse(response.data);
  }

  static async updateClub(id: number, data: ClubUpdate): Promise<Club> {
    const response = await apiClient.put(`/api/clubs/${id}`, data);
    return Club$.parse(response.data);
  }

  static async deleteClub(id: number): Promise<void> {
    await apiClient.delete(`/api/clubs/${id}`);
  }
}

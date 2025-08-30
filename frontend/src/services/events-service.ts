import { apiClient } from '@/lib/api-client';
import type { Event, EventCreate, EventUpdate } from '@repo/core/schemas';
import { Event$ } from '@repo/core/schemas';

export class EventsService {
  static async getEvents(): Promise<Event[]> {
    const response = await apiClient.get('/api/events');
    return Event$.array().parse(response.data);
  }

  static async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get(`/api/events/${id}`);
    return Event$.parse(response.data);
  }

  static async createEvent(data: EventCreate): Promise<Event> {
    const response = await apiClient.post('/api/events', data);
    return Event$.parse(response.data);
  }
  static async updateEvent(id: number, data: EventUpdate): Promise<Event> {
    const response = await apiClient.put(`/api/events/${id}`, data);
    return Event$.parse(response.data);
  }

  static async deleteEvent(id: number): Promise<void> {
    await apiClient.delete(`/api/events/${id}`);
  }
}

import { apiClient } from '@/lib/api-client';
import type {
  CategoryCreate,
  CategoryUpdate,
  FullCategory,
} from '@repo/core/schemas';
import { FullCategory$ } from '@repo/core/schemas';

export class CategoriesService {
  static async getCategories(): Promise<FullCategory[]> {
    const response = await apiClient.get('/api/categories');
    return FullCategory$.array().parse(response.data);
  }

  static async getCategory(id: number): Promise<FullCategory> {
    const response = await apiClient.get(`/api/categories/${id}`);
    return FullCategory$.parse(response.data);
  }

  static async createCategory(data: CategoryCreate): Promise<FullCategory> {
    const response = await apiClient.post('/api/categories', data);
    return FullCategory$.parse(response.data);
  }

  static async updateCategory(
    id: number,
    data: CategoryUpdate
  ): Promise<FullCategory> {
    const response = await apiClient.put(`/api/categories/${id}`, data);
    return FullCategory$.parse(response.data);
  }

  static async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/api/categories/${id}`);
  }
}

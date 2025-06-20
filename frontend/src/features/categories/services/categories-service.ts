import { apiClient } from '@/lib/api-client';
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
} from '@repo/core/schemas';
import { Category$ } from '@repo/core/schemas';

export class CategoriesService {
  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get('/api/categories');
    return Category$.array().parse(response.data);
  }

  static async getCategory(id: number): Promise<Category> {
    const response = await apiClient.get(`/api/categories/${id}`);
    return Category$.parse(response.data);
  }

  static async createCategory(data: CategoryCreate): Promise<Category> {
    const response = await apiClient.post('/api/categories', data);
    return Category$.parse(response.data);
  }

  static async updateCategory(
    id: number,
    data: CategoryUpdate
  ): Promise<Category> {
    const response = await apiClient.put(`/api/categories/${id}`, data);
    return Category$.parse(response.data);
  }

  static async deleteCategory(id: number): Promise<void> {
    await apiClient.delete(`/api/categories/${id}`);
  }
}

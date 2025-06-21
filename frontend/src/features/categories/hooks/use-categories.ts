import type { CategoryCreate, CategoryUpdate } from '@repo/core/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CategoriesService } from '../services/categories-service';

export const CATEGORIES_QUERY_KEY = 'categories';

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: CategoriesService.getCategories,
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY, id],
    queryFn: () => CategoriesService.getCategory(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryCreate) =>
      CategoriesService.createCategory(data),
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Create category error:', error);
      toast.error('Failed to create category');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdate }) =>
      CategoriesService.updateCategory(id, data),
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Update category error:', error);
      toast.error('Failed to update category');
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => CategoriesService.deleteCategory(id),
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Delete category error:', error);
      toast.error('Failed to delete category');
    },
  });
}

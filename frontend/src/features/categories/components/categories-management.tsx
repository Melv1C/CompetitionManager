import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCategories } from '../hooks/use-categories';
import { CategoriesTable } from './categories-table';
import { CategoryFormDialog } from './category-form-dialog';

export function CategoriesManagement() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const categories = useCategories();

  if (categories.isPending) {
    return <div className="text-center py-4">Loading categories...</div>;
  }

  if (categories.isError) {
    return <div className="text-center py-4">Failed to load categories</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categories ({categories.data.length})</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <CategoriesTable categories={categories.data} />

      <CategoryFormDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}

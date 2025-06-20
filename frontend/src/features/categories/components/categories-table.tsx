import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Category } from '@repo/core/schemas';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDeleteCategory } from '../hooks/use-categories';
import { CategoryFormDialog } from './category-form-dialog';

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
}

export function CategoriesTable({
  categories,
  isLoading,
}: CategoriesTableProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const deleteMutation = useDeleteCategory();

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getGenderColor = (gender: string) => {
    const colors: Record<string, string> = {
      M: 'bg-blue-100 text-blue-800',
      F: 'bg-pink-100 text-pink-800',
      X: 'bg-purple-100 text-purple-800',
    };
    return colors[gender] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (baseCategory: string) => {
    const colors: Record<string, string> = {
      Kangourou: 'bg-yellow-100 text-yellow-800',
      Benjamin: 'bg-orange-100 text-orange-800',
      Pupille: 'bg-red-100 text-red-800',
      Minime: 'bg-purple-100 text-purple-800',
      Cadet: 'bg-blue-100 text-blue-800',
      Scolaire: 'bg-cyan-100 text-cyan-800',
      Junior: 'bg-green-100 text-green-800',
      Espoir: 'bg-lime-100 text-lime-800',
      Senior: 'bg-emerald-100 text-emerald-800',
      Master: 'bg-gray-100 text-gray-800',
    };
    return colors[baseCategory] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading categories...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Abbr</TableHead>
            <TableHead>Base Category</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Master Age</TableHead>
            <TableHead>Order</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell>{category.abbr}</TableCell>
              <TableCell>
                <Badge
                  className={getCategoryColor(category.baseCategory)}
                  variant="secondary"
                >
                  {category.abbrBaseCategory}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={getGenderColor(category.gender)}
                  variant="secondary"
                >
                  {category.gender}
                </Badge>
              </TableCell>
              <TableCell>{category.masterAgeGroup || '-'}</TableCell>
              <TableCell>{category.order}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(category.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!!editingCategory && (
        <CategoryFormDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
        />
      )}
    </>
  );
}

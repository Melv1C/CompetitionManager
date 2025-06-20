import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AbbrBaseCategory$,
  BaseCategory$,
  CategoryCreate$,
  CategoryUpdate$,
  Gender$,
  type Category,
  type CategoryCreate,
  type CategoryUpdate,
} from '@repo/core/schemas';
import { useForm } from 'react-hook-form';
import { useCreateCategory, useUpdateCategory } from '../hooks/use-categories';

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const isEditing = !!category;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm<CategoryCreate | CategoryUpdate>({
    resolver: zodResolver(isEditing ? CategoryUpdate$ : CategoryCreate$),
    defaultValues: {
      name: category?.name ?? '',
      abbr: category?.abbr ?? '',
      baseCategory: category?.baseCategory ?? BaseCategory$.enum.Senior,
      abbrBaseCategory:
        category?.abbrBaseCategory ?? AbbrBaseCategory$.enum.SEN,
      gender: category?.gender ?? Gender$.enum.M,
      masterAgeGroup: category?.masterAgeGroup ?? null,
      order: category?.order ?? 1,
    },
  });

  const onSubmit = async (data: CategoryCreate | CategoryUpdate) => {
    if (isEditing && category) {
      await updateMutation.mutateAsync({
        id: category.id,
        data: data as CategoryUpdate,
      });
    } else {
      await createMutation.mutateAsync(data as CategoryCreate);
    }
    form.reset();
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pr-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="abbr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Abbreviation</FormLabel>
                      <FormControl>
                        <Input placeholder="Category abbreviation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Gender$.options.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender === 'M' ? 'Male' : 'Female'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baseCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select base category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BaseCategory$.options.map((baseCategory) => (
                            <SelectItem key={baseCategory} value={baseCategory}>
                              {baseCategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="abbrBaseCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Category Abbr.</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select abbreviation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AbbrBaseCategory$.options.map((abbrBaseCategory) => (
                            <SelectItem
                              key={abbrBaseCategory}
                              value={abbrBaseCategory}
                            >
                              {abbrBaseCategory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Display order"
                          min="1"
                          {...field}
                          value={field.value?.toString() || ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? '' : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="masterAgeGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Master Age Group</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Age group (optional)"
                          min="0"
                          {...field}
                          value={field.value?.toString() || ''}
                          onChange={(event) => {
                            const value = event.target.value;
                            field.onChange(value === '' ? null : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

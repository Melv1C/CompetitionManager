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
import { zodResolver } from '@hookform/resolvers/zod';
import type { Club, ClubCreate, ClubUpdate } from '@repo/core/schemas';
import { ClubCreate$, ClubUpdate$ } from '@repo/core/schemas';
import { useForm } from 'react-hook-form';
import { useCreateClub, useUpdateClub } from '../hooks/use-clubs';

interface ClubFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club?: Club;
}

const BELGIAN_PROVINCES = [
  'Antwerp',
  'East Flanders',
  'West Flanders',
  'Limburg',
  'Flemish Brabant',
  'Walloon Brabant',
  'Hainaut',
  'Liege',
  'Luxembourg',
  'Namur',
  'Brussels',
] as const;

const COUNTRIES = [
  'Belgium',
  'Netherlands',
  'France',
  'Germany',
  'Luxembourg',
  'United Kingdom',
] as const;

export function ClubFormDialog({
  open,
  onOpenChange,
  club,
}: ClubFormDialogProps) {
  const isEditing = !!club;
  const createMutation = useCreateClub();
  const updateMutation = useUpdateClub();

  const form = useForm<ClubCreate | ClubUpdate>({
    resolver: zodResolver(isEditing ? ClubUpdate$ : ClubCreate$),
    defaultValues: {
      name: club?.name,
      abbr: club?.abbr,
      address: club?.address,
      province: club?.province,
      country: club?.country,
      fedNumber: club?.fedNumber,
      fedAbbr: club?.fedAbbr,
    },
  });
  const onSubmit = async (data: ClubCreate | ClubUpdate) => {
    // Convert empty strings to null values
    const transformedData = Object.entries(data).reduce((acc, [key, value]) => {
      // Convert empty strings to null, leave other values untouched
      acc[key] = value === '' ? null : value;
      return acc;
    }, {} as Record<string, string | number | null>);

    if (isEditing && club) {
      await updateMutation.mutateAsync({
        id: club.id,
        data: transformedData as ClubUpdate,
      });
    } else {
      await createMutation.mutateAsync(transformedData as ClubCreate);
    }
    form.reset();
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Club' : 'Create Club'}</DialogTitle>
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
                      <FormLabel>
                        Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Club name" required {...field} />
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
                      <FormLabel>
                        Abbreviation <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Club abbreviation"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fedAbbr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Federation Abbr</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Federation abbreviation"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Club address"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Province (e.g. Antwerp)"
                          {...field}
                          value={field.value || ''}
                          list="provinces"
                        />
                      </FormControl>
                      <datalist id="provinces">
                        {BELGIAN_PROVINCES.map((province) => (
                          <option key={province} value={province} />
                        ))}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Country (e.g. Belgium)"
                          {...field}
                          value={field.value || ''}
                          list="countries"
                        />
                      </FormControl>
                      <datalist id="countries">
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country} />
                        ))}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fedNumber"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Federation Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Federation number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value;
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

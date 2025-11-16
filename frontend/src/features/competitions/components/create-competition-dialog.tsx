import { zodResolver } from '@hookform/resolvers/zod';
import { CompetitionCreate$, type CompetitionCreate } from '@repo/core/schemas';
import {
  Button,
  DateTimePicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@repo/ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { useCreateCompetition } from '../hooks/use-organization-competitions';

interface CreateCompetitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompetitionDialog({ open, onOpenChange }: CreateCompetitionDialogProps) {
  const createMutation = useCreateCompetition();

  const getDefaultStartDate = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilNextSaturday = currentDay === 6 ? 7 : (6 - currentDay + 7) % 7;

    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + daysUntilNextSaturday);
    nextSaturday.setHours(10, 0, 0, 0);

    return nextSaturday;
  };

  const form = useForm<CompetitionCreate>({
    resolver: zodResolver(
      CompetitionCreate$.extend({
        startDate: z.date(), // Need to ensure startDate only accepts Date objects
      }),
    ),
    defaultValues: {
      name: '',
      startDate: getDefaultStartDate(),
    },
  });

  const onSubmit = async (data: CompetitionCreate) => {
    await createMutation.mutateAsync(data);
    form.reset({ name: '', startDate: getDefaultStartDate() });
    onOpenChange(false);
  };

  const isLoading = createMutation.isPending;

  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Competition</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Competition name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={date => date && field.onChange(date)}
                      placeholder="Select date and time"
                      allowClear={false}
                      minDate={tomorrow}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

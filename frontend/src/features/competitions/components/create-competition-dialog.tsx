import { DateTimePicker } from '@/components/date-time-picker';
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
import {
  CompetitionCreate$,
  type CompetitionCreate,
} from '@competition-manager/core/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useCreateCompetition } from '../hooks/use-competitions';

interface CreateCompetitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompetitionDialog({
  open,
  onOpenChange,
}: CreateCompetitionDialogProps) {
  const createMutation = useCreateCompetition();

  const getDefaultStartDate = () => {
    const date = new Date();
    date.setHours(10, 0, 0, 0);
    return date;
  };

  const form = useForm<CompetitionCreate>({
    resolver: zodResolver(CompetitionCreate$),
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
                      onChange={(date) => date && field.onChange(date)}
                      placeholder="Select date and time"
                      initialTime='10:00'
                      allowClear={false}
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

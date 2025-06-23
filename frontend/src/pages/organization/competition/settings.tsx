import { DateTimePicker } from '@/components/date-time-picker';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useClubs } from '@/features/clubs/hooks/use-clubs';
import {
  useOrganizationCompetitionStore,
} from '@/store/organization-competition';
import { authClient } from '@/lib/auth-client';
import {
  CompetitionUpdate$,
  type CompetitionUpdate,
} from '@repo/core/schemas';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateOrganizationCompetition } from '@/features/competitions/hooks/use-competition';

export function CompetitionSettings() {
  const { currentCompetition } = useOrganizationCompetitionStore();
  const { data: clubs = [] } = useClubs();
  const updateMutation = useUpdateOrganizationCompetition();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    authClient.organization
      .hasPermission({ permissions: { competitions: ['update'] } })
      .then(setCanEdit)
      .catch(() => setCanEdit(false));
  }, []);

  const form = useForm<CompetitionUpdate>({
    resolver: zodResolver(CompetitionUpdate$),
    defaultValues: {},
  });

  useEffect(() => {
    if (currentCompetition) {
      form.reset({
        name: currentCompetition.name,
        startDate: new Date(currentCompetition.startDate),
        endDate: currentCompetition.endDate
          ? new Date(currentCompetition.endDate)
          : undefined,
        isPublished: currentCompetition.isPublished,
        description: currentCompetition.description,
        location: currentCompetition.location,
        bibPermissions: currentCompetition.bibPermissions,
        bibStartNumber: currentCompetition.bibStartNumber ?? undefined,
        isPaidOnline: currentCompetition.isPaidOnline,
        isSelection: currentCompetition.isSelection,
        isInscriptionVisible: currentCompetition.isInscriptionVisible,
        freeClubIds: currentCompetition.freeClubs.map((c) => c.id),
        allowedClubIds: currentCompetition.allowedClubs.map((c) => c.id),
      });
    }
  }, [currentCompetition, form]);

  const onSubmit = async (data: CompetitionUpdate) => {
    if (!currentCompetition) return;
    await updateMutation.mutateAsync({ eid: currentCompetition.eid, data });
  };

  const { isDirty } = form.formState;
  const disabled = !isDirty || !canEdit || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competition Settings</h1>
          <p className="text-muted-foreground">Adjust competition configuration.</p>
        </div>
        <Button
          size="icon"
          onClick={form.handleSubmit(onSubmit)}
          disabled={disabled}
        >
          <Save className="size-4" />
          <span className="sr-only">Save</span>
        </Button>
      </div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Competition name" {...field} disabled={!canEdit} />
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
                      allowClear={false}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date ?? undefined)}
                      placeholder="Select date and time"
                      allowClear
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Location" {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} disabled={!canEdit} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end gap-2">
                  <FormLabel>Published</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <details className="rounded-md border p-4" open={false}>
            <summary className="cursor-pointer select-none text-sm font-medium">Advanced Options</summary>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bibPermissions"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Bib Permissions</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        value={(field.value ?? []).join('\n')}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              .split(/\n+/)
                              .map((v) => v.trim())
                              .filter(Boolean)
                          )
                        }
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bibStartNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? undefined : Number(e.target.value)
                          )
                        }
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPaidOnline"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end gap-2">
                    <FormLabel>Paid Online</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isSelection"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end gap-2">
                    <FormLabel>Selection</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isInscriptionVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end gap-2">
                    <FormLabel>Inscriptions Visible</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="freeClubIds"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Free Clubs</FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2 mt-2">
                      {clubs.map((club) => {
                        const checked = field.value?.includes(club.id) ?? false;
                        return (
                          <label key={club.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                const ids = field.value ? [...field.value] : [];
                                if (value) {
                                  if (!ids.includes(club.id)) ids.push(club.id);
                                } else {
                                  const idx = ids.indexOf(club.id);
                                  if (idx >= 0) ids.splice(idx, 1);
                                }
                                field.onChange(ids);
                              }}
                              disabled={!canEdit}
                            />
                            <span>{club.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowedClubIds"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Allowed Clubs</FormLabel>
                    <div className="grid gap-2 sm:grid-cols-2 mt-2">
                      {clubs.map((club) => {
                        const checked = field.value?.includes(club.id) ?? false;
                        return (
                          <label key={club.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => {
                                const ids = field.value ? [...field.value] : [];
                                if (value) {
                                  if (!ids.includes(club.id)) ids.push(club.id);
                                } else {
                                  const idx = ids.indexOf(club.id);
                                  if (idx >= 0) ids.splice(idx, 1);
                                }
                                field.onChange(ids);
                              }}
                              disabled={!canEdit}
                            />
                            <span>{club.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </details>
        </form>
      </Form>
    </div>
  );
}

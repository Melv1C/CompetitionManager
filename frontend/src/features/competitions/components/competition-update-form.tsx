import { DateTimePicker } from '@/components/date-time-picker';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
import { Textarea } from '@/components/ui/textarea';
import { useClubs } from '@/features/clubs/hooks/use-clubs';
import { useUpdateCompetition } from '@/features/competitions/hooks/use-organization-competitions';
import { authClient } from '@/lib/auth-client';
import { useOrganizationCompetitionStore } from '@/store/organization-competition';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompetitionUpdate$, type CompetitionUpdate } from '@repo/core/schemas';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod/v4';
import { ClubSelector } from './club-selector';
import { SwitchField } from './switch-field';

export function CompetitionUpdateForm() {
  const { currentCompetition } = useOrganizationCompetitionStore();
  const { data: clubs = [] } = useClubs();
  const updateMutation = useUpdateCompetition();
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: { competitions: ['update'] },
        });
        if (result.data?.success) {
          setCanEdit(true);
        } else {
          setCanEdit(false);
        }
      } catch {
        setCanEdit(false);
      }
    };
    checkPermission();
  }, []);

  const form = useForm<CompetitionUpdate>({
    resolver: zodResolver(
      CompetitionUpdate$.extend({
        startDate: z.date(), // Ensure startDate is a Date object
        endDate: z.date().nullish(), // Allow endDate to be optional
        isPublished: z.boolean(),
        isInscriptionVisible: z.boolean(),
        isPaidOnline: z.boolean(),
        isSelection: z.boolean(),
        description: z.string(),
        location: z.string(),
        bibPermissions: z.array(z.string()),
        freeClubIds: z.array(z.number()),
        allowedClubIds: z.array(z.number()),
      })
    ),
  });

  useEffect(() => {
    console.log('Current competition:', currentCompetition);
    if (currentCompetition) {
      console.log('Resetting form with competition data');
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
  console.log('Form dirty state:', isDirty);
  const disabled = !isDirty || !canEdit || updateMutation.isPending;

  if (!currentCompetition) {
    return <div>No competition selected</div>;
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Save button */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Button
            type="submit"
            disabled={disabled}
            className="ml-auto"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Competition Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter competition name"
                      {...field}
                      disabled={!canEdit}
                    />
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
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={(date) => date && field.onChange(date)}
                      placeholder="Select start date and time"
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
                  <FormLabel>End Date & Time (Optional)</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value ?? undefined}
                      onChange={(date) => field.onChange(date ?? undefined)}
                      placeholder="Select end date and time"
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
                    <Input
                      placeholder="Enter competition location"
                      {...field}
                      disabled={!canEdit}
                    />
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
                    <Textarea
                      rows={4}
                      placeholder="Enter competition description..."
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>{' '}
        {/* Publication Settings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Publication Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <SwitchField
                  label="Published"
                  description="Make competition visible to public"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={!canEdit}
                />
              )}
            />
          </div>
        </div>
        {/* Advanced Options */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="registration-payment">
            <AccordionTrigger className="text-lg font-semibold">
              Registration & Payment Settings
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              {' '}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="isPaidOnline"
                  render={({ field }) => (
                    <SwitchField
                      label="Online Payment"
                      description="Allow online payments"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!canEdit}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="isSelection"
                  render={({ field }) => (
                    <SwitchField
                      label="Selection"
                      description="Requires selection process"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!canEdit}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="isInscriptionVisible"
                  render={({ field }) => (
                    <SwitchField
                      label="Visible Registrations"
                      description="Show registration list publicly"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!canEdit}
                    />
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="bib-management">
            <AccordionTrigger className="text-lg font-semibold">
              Bib Management
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bibPermissions"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Bib Permissions</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
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
                          placeholder="Enter permissions, one per line"
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
                      <FormLabel>Bib Start Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value)
                            )
                          }
                          disabled={!canEdit}
                          placeholder="Starting bib number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="club-management">
            <AccordionTrigger className="text-lg font-semibold">
              Club Management
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="freeClubIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Free Clubs</FormLabel>
                      <FormControl>
                        <ClubSelector
                          clubs={clubs}
                          selectedIds={field.value ?? []}
                          onSelectionChange={field.onChange}
                          disabled={!canEdit}
                          placeholder="Select clubs that don't need to pay..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowedClubIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed Clubs</FormLabel>
                      <FormControl>
                        <ClubSelector
                          clubs={clubs}
                          selectedIds={field.value ?? []}
                          onSelectionChange={field.onChange}
                          disabled={!canEdit}
                          placeholder="Select clubs allowed to participate..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
}

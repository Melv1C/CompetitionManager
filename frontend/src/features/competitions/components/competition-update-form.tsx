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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog';
import { useClubs } from '@/features/clubs';
import { useUpdateCompetition } from '@/features/competitions';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { authClient } from '@/lib/auth-client';
import { useOrganizationCompetitionStore } from '@/store/organization-competition';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompetitionUpdate$, type CompetitionUpdate } from '@repo/core/schemas';
import { Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
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
        endDate: z.date(),
        inscriptionStartDate: z.date(),
        inscriptionEndDate: z.date(),
        isPublished: z.boolean(),
        isInscriptionVisible: z.boolean(),
        isPaidOnline: z.boolean(),
        isSelection: z.boolean(),
        description: z.string(),
        location: z.string(),
        bibPermissions: z.array(z.string()),
        freeClubIds: z.array(z.number()),
        allowedClubIds: z.array(z.number()),
      }),
    ),
  });

  useEffect(() => {
    if (currentCompetition) {
      form.reset({
        name: currentCompetition.name,
        startDate: new Date(currentCompetition.startDate),
        endDate: new Date(currentCompetition.endDate),
        inscriptionStartDate: new Date(currentCompetition.inscriptionStartDate),
        inscriptionEndDate: new Date(currentCompetition.inscriptionEndDate),
        isPublished: currentCompetition.isPublished,
        description: currentCompetition.description,
        location: currentCompetition.location,
        bibPermissions: currentCompetition.bibPermissions,
        bibStartNumber: currentCompetition.bibStartNumber ?? undefined,
        isPaidOnline: currentCompetition.isPaidOnline,
        isSelection: currentCompetition.isSelection,
        isInscriptionVisible: currentCompetition.isInscriptionVisible,
        freeClubIds: currentCompetition.freeClubs.map(c => c.id),
        allowedClubIds: currentCompetition.allowedClubs.map(c => c.id),
      });
    }
  }, [currentCompetition, form]);
  
  const onSubmit = useCallback(
    async (data: CompetitionUpdate) => {
      if (!currentCompetition) return;
      try {
        await updateMutation.mutateAsync({ eid: currentCompetition.eid, data });
        // Reset form dirty state after successful save
        form.reset(form.getValues());
      } catch (error) {
        // Error handling is managed by the mutation
        console.error('Failed to update competition:', error);
      }
    },
    [currentCompetition, updateMutation, form],
  );

  const { isDirty } = form.formState;
  const disabled = !isDirty || !canEdit || updateMutation.isPending;
  // Handle unsaved changes navigation blocking
  const { blocker, proceedNavigation, resetNavigation } = useUnsavedChanges({
    hasUnsavedChanges: isDirty && canEdit,
    message: 'You have unsaved changes to the competition. Are you sure you want to leave?',
  });

  // Add keyboard shortcut for saving (Ctrl+S or Cmd+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!disabled) {
          form.handleSubmit(onSubmit)();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, form, onSubmit]);

  if (!currentCompetition) {
    return <div>No competition selected</div>;
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Save button (desktop only) */}
        <div className="hidden md:absolute md:top-4 md:right-4 md:flex md:flex-col md:items-center md:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" disabled={disabled} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save changes (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>
          {isDirty && canEdit && (
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
          )}
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
                    <Input placeholder="Enter competition name" {...field} disabled={!canEdit} />
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
                      onChange={date => field.onChange(date)}
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
                  <FormLabel>End Date & Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={date => field.onChange(date)}
                      placeholder="Select end date and time"
                      allowClear
                      disabled={!canEdit}
                      minDate={form.watch('startDate')}
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
        </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="inscriptionStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Start Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={date => field.onChange(date)}
                          placeholder="Select registration start date and time"
                          allowClear={false}
                          disabled={!canEdit}
                          maxDate={form.watch('inscriptionEndDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inscriptionEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration End Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={date => field.onChange(date)}
                          placeholder="Select registration end date and time"
                          disabled={!canEdit}
                          allowClear={false}
                          minDate={form.watch('inscriptionStartDate')}
                          maxDate={form.watch('startDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
            <AccordionTrigger className="text-lg font-semibold">Bib Management</AccordionTrigger>
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
                          onChange={e =>
                            field.onChange(
                              e.target.value
                                .split(/\n+/)
                                .map(v => v.trim())
                                .filter(Boolean),
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
                          onChange={e =>
                            field.onChange(
                              e.target.value === '' ? undefined : Number(e.target.value),
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
            <AccordionTrigger className="text-lg font-semibold">Club Management</AccordionTrigger>
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

        {/* Mobile sticky save button */}
        <div className="md:hidden sticky bottom-0 bg-background border-t pt-4 mt-8">
          <Button type="submit" disabled={disabled} className="w-full" size="lg">
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          {isDirty && canEdit && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              You have unsaved changes
            </p>
          )}
        </div>
      </form>

      {/* Unsaved changes dialog */}
      <UnsavedChangesDialog
        open={blocker.state === 'blocked'}
        onConfirm={proceedNavigation}
        onCancel={resetNavigation}
        title="Unsaved Competition Changes"
        description="You have unsaved changes to the competition that will be lost if you continue. Are you sure you want to leave?"
      />
    </Form>
  );
}

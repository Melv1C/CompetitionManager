import { DateTimePicker } from '@/components/date-time-picker';
import { RichTextEditor, RichTextViewer } from '@/components/rich-text';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog';
import { ClubSelector, useClubs } from '@/features/clubs';
import { useUpdateCompetition } from '@/features/competitions';
import { useOrganizationCompetitionStore } from '@/features/organization-competitions/store/organization-competition';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompetitionUpdate$, type Competition, type CompetitionUpdate } from '@repo/core/schemas';
import { AlertCircle, Flag, Globe, Info, Save, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import {
  getFieldEditability,
  getFieldRuleStyle,
  type FieldEditabilityRule,
} from '../utils/field-editability';
import { SwitchField } from './switch-field';

interface FieldWrapperProps {
  fieldName: string;
  children: React.ReactNode;
  competition: Competition;
  className?: string;
}

function FieldWrapper({ fieldName, children, competition, className }: FieldWrapperProps) {
  const editability = getFieldEditability(fieldName, competition);
  const style = getFieldRuleStyle(editability.rule);

  // Get the appropriate icon based on rule (not editability)
  const IconComponent =
    editability.rule === 'locked-after-publish'
      ? Globe
      : editability.rule === 'locked-after-inscription-start'
        ? UserCheck
        : editability.rule === 'locked-after-competition-start'
          ? Flag
          : null;

  // Show badge only if field has a locking rule (not "always")
  const showBadge = editability.rule !== 'always' && IconComponent;

  return (
    <div className={cn('relative', className)}>
      {children}
      {showBadge && (
        <div className="absolute -top-2 -right-2 z-10">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm',
                  style.bgClassName,
                  style.borderClassName,
                  // Make editable fields more subtle
                  editability.isEditable && 'opacity-50 hover:opacity-100 transition-opacity',
                )}
              >
                <IconComponent className={cn('h-4 w-4', style.textClassName)} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="font-semibold">{style.label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {editability.isEditable ? style.description : editability.reason}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Section({ id, title, description, icon, children }: SectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const section = searchParams.get('section');
    if (section === id && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchParams, id]);

  return (
    <div ref={sectionRef} id={id} className="scroll-mt-24 space-y-4 rounded-lg border p-6">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 text-primary">{icon}</div>}
        <div className="flex-1 space-y-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export function CompetitionUpdateForm() {
  const { currentCompetition } = useOrganizationCompetitionStore();
  const { data: clubs = [] } = useClubs();
  const updateMutation = useUpdateCompetition();
  const [canEdit, setCanEdit] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [pendingPublishValue, setPendingPublishValue] = useState(false);

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
        startDate: z.date(),
        endDate: z.date(),
        inscriptionStartDate: z.date(),
        inscriptionEndDate: z.date(),
        isPublished: z.boolean(),
        isInscriptionVisible: z.boolean(),
        isPaidOnline: z.boolean(),
        isSelection: z.boolean(),
        hasConfirmation: z.boolean(),
        description: z.string(),
        location: z.string(),
        contactPhone: z.string(),
        contactEmail: z.string(),
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
        contactPhone: currentCompetition.contactPhone,
        contactEmail: currentCompetition.contactEmail,
        bibPermissions: currentCompetition.bibPermissions,
        bibStartNumber: currentCompetition.bibStartNumber ?? undefined,
        isPaidOnline: currentCompetition.isPaidOnline,
        isSelection: currentCompetition.isSelection,
        hasConfirmation: currentCompetition.hasConfirmation,
        isInscriptionVisible: currentCompetition.isInscriptionVisible,
        maxEventPerAthlete: currentCompetition.maxEventPerAthlete,
        confirmationDeadlineMinutes: currentCompetition.confirmationDeadlineMinutes,
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
        form.reset(form.getValues());
      } catch (error) {
        console.error('Failed to update competition:', error);
      }
    },
    [currentCompetition, updateMutation, form],
  );

  const handlePublishToggle = useCallback(
    async (checked: boolean) => {
      if (!currentCompetition || !canEdit) return;

      if (checked && !currentCompetition.isPublished) {
        setPendingPublishValue(checked);
        setShowPublishDialog(true);
      } else {
        // Allow unpublishing without confirmation
        try {
          await updateMutation.mutateAsync({
            eid: currentCompetition.eid,
            data: { ...form.getValues(), isPublished: checked },
          });
        } catch (error) {
          console.error('Failed to update publish status:', error);
        }
      }
    },
    [currentCompetition, canEdit, updateMutation, form],
  );

  const confirmPublish = useCallback(async () => {
    if (!currentCompetition) return;

    try {
      await updateMutation.mutateAsync({
        eid: currentCompetition.eid,
        data: { ...form.getValues(), isPublished: pendingPublishValue },
      });
      setShowPublishDialog(false);
    } catch (error) {
      console.error('Failed to publish competition:', error);
    }
  }, [currentCompetition, updateMutation, form, pendingPublishValue]);

  const { isDirty } = form.formState;
  const disabled = !isDirty || !canEdit || updateMutation.isPending;

  const { blocker, proceedNavigation, resetNavigation } = useUnsavedChanges({
    hasUnsavedChanges: isDirty && canEdit,
    message: 'You have unsaved changes to the competition. Are you sure you want to leave?',
  });

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
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">No competition selected</p>
      </div>
    );
  }

  // Check if field is editable
  const isFieldEditable = (fieldName: string) => {
    const editability = getFieldEditability(fieldName, currentCompetition);
    return editability.isEditable && canEdit;
  };

  return (
    <div className="relative pb-24">
      {/* Sticky Header with Save Button and Publish Toggle */}
      <div className="sticky top-0 z-10 mb-6 flex items-center justify-between gap-4 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{currentCompetition.name}</h1>
          {isDirty && canEdit && (
            <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Publish Toggle */}
          <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
            <span className="text-sm font-medium">Published</span>
            <Switch
              checked={currentCompetition.isPublished}
              onCheckedChange={handlePublishToggle}
              disabled={
                !canEdit ||
                !getFieldEditability('isPublished', currentCompetition).isEditable ||
                updateMutation.isPending
              }
            />
            {currentCompetition.isPublished && (
              <span className="text-xs text-green-600 dark:text-green-400">●</span>
            )}
          </div>

          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" disabled={disabled} onClick={form.handleSubmit(onSubmit)}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save changes (Ctrl+S)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Field Editability Legend */}
      <div className="mb-6 overflow-hidden rounded-lg border bg-card">
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-muted-foreground" />
            Field Locking Rules
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Fields with badges become locked at different stages. Fields without badges can always
            be edited.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              'locked-after-publish',
              'locked-after-inscription-start',
              'locked-after-competition-start',
            ] as FieldEditabilityRule[]
          ).map(rule => {
            const style = getFieldRuleStyle(rule);
            const IconComponent =
              rule === 'locked-after-publish'
                ? Globe
                : rule === 'locked-after-inscription-start'
                  ? UserCheck
                  : Flag;

            return (
              <div
                key={rule}
                className={cn(
                  'flex items-start gap-3 rounded-md border p-3 transition-colors',
                  style.bgClassName,
                  style.borderClassName,
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background/50',
                  )}
                >
                  <IconComponent className={cn('h-4 w-4', style.textClassName)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium', style.textClassName)}>{style.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{style.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Basic Information Section */}
          <Section
            id="basic-info"
            title="Basic Information"
            description="Core details about the competition"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper
                fieldName="name"
                competition={currentCompetition}
                className="sm:col-span-2"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competition Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter competition name"
                          {...field}
                          disabled={!isFieldEditable('name')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="startDate" competition={currentCompetition}>
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
                          disabled={!isFieldEditable('startDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="endDate" competition={currentCompetition}>
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
                          disabled={!isFieldEditable('endDate')}
                          minDate={form.watch('startDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper
                fieldName="location"
                competition={currentCompetition}
                className="sm:col-span-2"
              >
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter competition location"
                          {...field}
                          disabled={!isFieldEditable('location')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper
                fieldName="description"
                competition={currentCompetition}
                className="sm:col-span-2"
              >
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        {isFieldEditable('description') ? (
                          <RichTextEditor
                            content={field.value}
                            onChange={field.onChange}
                            placeholder="Enter competition description..."
                          />
                        ) : (
                          <RichTextViewer content={field.value} />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>
            </div>
          </Section>

          {/* Contact Information Section */}
          <Section
            id="contact-info"
            title="Contact Information"
            description="Contact details for participants"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper fieldName="contactEmail" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@example.com"
                          {...field}
                          value={field.value || ''}
                          disabled={!isFieldEditable('contactEmail')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="contactPhone" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          {...field}
                          value={field.value || ''}
                          onChange={e => field.onChange(e.target.value || '')}
                          disabled={!isFieldEditable('contactPhone')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>
            </div>
          </Section>

          {/* Registration Settings Section */}
          <Section
            id="registration"
            title="Registration Settings"
            description="Configure registration dates and participant limits"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper fieldName="inscriptionStartDate" competition={currentCompetition}>
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
                          disabled={!isFieldEditable('inscriptionStartDate')}
                          maxDate={form.watch('inscriptionEndDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="inscriptionEndDate" competition={currentCompetition}>
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
                          disabled={!isFieldEditable('inscriptionEndDate')}
                          allowClear={false}
                          minDate={form.watch('inscriptionStartDate')}
                          maxDate={form.watch('startDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="maxEventPerAthlete" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="maxEventPerAthlete"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Events per Athlete</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="No limit"
                          {...field}
                          value={field.value || ''}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          disabled={!isFieldEditable('maxEventPerAthlete')}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for no limit on events per athlete
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="isInscriptionVisible" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="isInscriptionVisible"
                  render={({ field }) => (
                    <SwitchField
                      label="Visible Registrations"
                      description="Show registration list publicly"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!isFieldEditable('isInscriptionVisible')}
                    />
                  )}
                />
              </FieldWrapper>
            </div>
          </Section>

          {/* Payment & Selection Section */}
          <Section
            id="payment"
            title="Payment & Selection"
            description="Configure payment options and selection process"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FieldWrapper fieldName="isPaidOnline" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="isPaidOnline"
                  render={({ field }) => (
                    <SwitchField
                      label="Online Payment"
                      description="Allow online payments"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!isFieldEditable('isPaidOnline')}
                    />
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="isSelection" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="isSelection"
                  render={({ field }) => (
                    <SwitchField
                      label="Selection"
                      description="Requires selection process"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!isFieldEditable('isSelection')}
                    />
                  )}
                />
              </FieldWrapper>
            </div>
          </Section>

          {/* Confirmation Settings Section */}
          <Section
            id="confirmation"
            title="Confirmation Settings"
            description="Require athletes to confirm their participation"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper fieldName="hasConfirmation" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="hasConfirmation"
                  render={({ field }) => (
                    <SwitchField
                      label="Require Confirmation"
                      description="Athletes must confirm their participation before the competition"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      disabled={!isFieldEditable('hasConfirmation')}
                    />
                  )}
                />
              </FieldWrapper>

              {form.watch('hasConfirmation') && (
                <FieldWrapper
                  fieldName="confirmationDeadlineMinutes"
                  competition={currentCompetition}
                >
                  <FormField
                    control={form.control}
                    name="confirmationDeadlineMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmation Deadline (minutes before start)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="e.g., 60"
                            {...field}
                            value={field.value || ''}
                            onChange={e =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            disabled={!isFieldEditable('confirmationDeadlineMinutes')}
                          />
                        </FormControl>
                        <FormDescription>
                          How many minutes before the competition starts must athletes confirm
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FieldWrapper>
              )}
            </div>
          </Section>

          {/* Bib Management Section */}
          <Section
            id="bib-management"
            title="Bib Management"
            description="Configure bib numbers and permissions"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldWrapper
                fieldName="bibPermissions"
                competition={currentCompetition}
                className="sm:col-span-2"
              >
                <FormField
                  control={form.control}
                  name="bibPermissions"
                  render={({ field }) => (
                    <FormItem>
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
                          disabled={!isFieldEditable('bibPermissions')}
                          placeholder="Enter permissions, one per line"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="bibStartNumber" competition={currentCompetition}>
                <FormField
                  control={form.control}
                  name="bibStartNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bib Start Number</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="e.g., 100"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e =>
                            field.onChange(e.target.value ? Number(e.target.value) : null)
                          }
                          disabled={!isFieldEditable('bibStartNumber')}
                        />
                      </FormControl>
                      <FormDescription>
                        Starting number for automatic bib assignment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>
            </div>
          </Section>

          {/* Club Management Section */}
          <Section
            id="club-management"
            title="Club Management"
            description="Manage free and allowed clubs for this competition"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FieldWrapper fieldName="freeClubIds" competition={currentCompetition}>
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
                      <FormDescription>
                        Clubs whose members don't pay registration fees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>

              <FieldWrapper fieldName="allowedClubIds" competition={currentCompetition}>
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
                      <FormDescription>
                        Clubs whose members are allowed to register (empty = all clubs)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldWrapper>
            </div>
          </Section>
        </form>
      </Form>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Competition?</AlertDialogTitle>
            <AlertDialogDescription>
              Publishing this competition will make it visible to the public. Some fields will
              become locked and cannot be changed after publishing. Are you sure you want to
              continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPublish}>Publish Competition</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={blocker.state === 'blocked'}
        onConfirm={proceedNavigation}
        onCancel={resetNavigation}
        title="Unsaved Competition Changes"
        description="You have unsaved changes to the competition that will be lost if you continue. Are you sure you want to leave?"
      />
    </div>
  );
}

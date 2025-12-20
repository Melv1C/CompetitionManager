import { ClubSelector } from '@/features/clubs';
import type { Club, Competition, CompetitionUpdate } from '@repo/core/schemas';
import {
  DateTimePicker,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RichTextEditor,
  RichTextViewer,
  Textarea,
} from '@repo/ui';
import type { UseFormReturn } from 'react-hook-form';
import { SwitchField } from '../switch-field';
import { FieldWrapper } from './field-wrapper';
import { Section } from './section';

interface FormSectionsProps {
  form: UseFormReturn<CompetitionUpdate>;
  competition: Competition;
  clubs: Club[];
  isFieldEditable: (fieldName: string) => boolean;
  canEdit: boolean;
}

export function FormSections({
  form,
  competition,
  clubs,
  isFieldEditable,
  canEdit,
}: FormSectionsProps) {
  return (
    <>
      {/* Basic Information Section */}
      <Section
        id="basic-info"
        title="Basic Information"
        description="Core details about the competition"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper fieldName="name" competition={competition} className="sm:col-span-2">
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

          <FieldWrapper fieldName="startDate" competition={competition}>
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

          <FieldWrapper fieldName="endDate" competition={competition}>
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

          <FieldWrapper fieldName="location" competition={competition} className="sm:col-span-2">
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

          <FieldWrapper fieldName="description" competition={competition} className="sm:col-span-2">
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
          <FieldWrapper fieldName="contactEmail" competition={competition}>
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

          <FieldWrapper fieldName="contactPhone" competition={competition}>
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
          <FieldWrapper fieldName="inscriptionStartDate" competition={competition}>
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

          <FieldWrapper fieldName="inscriptionEndDate" competition={competition}>
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

          <FieldWrapper fieldName="maxEventPerAthlete" competition={competition}>
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
                  <FormDescription>Leave empty for no limit on events per athlete</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper fieldName="recordsFromDate" competition={competition}>
            <FormField
              control={form.control}
              name="recordsFromDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Records From Date</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value ?? undefined}
                      onChange={date => field.onChange(date ?? null)}
                      placeholder="All-time best"
                      allowClear
                      disabled={!isFieldEditable('recordsFromDate')}
                      maxDate={new Date()}
                    />
                  </FormControl>
                  <FormDescription>
                    Only consider personal records on or after this date. Leave empty to use
                    all-time best.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper fieldName="isInscriptionVisible" competition={competition}>
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
          <FieldWrapper fieldName="isPaidOnline" competition={competition}>
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

          <FieldWrapper fieldName="isSelection" competition={competition}>
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
          <FieldWrapper fieldName="hasConfirmation" competition={competition}>
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
            <FieldWrapper fieldName="confirmationDeadlineMinutes" competition={competition}>
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
            competition={competition}
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

          <FieldWrapper fieldName="bibStartNumber" competition={competition}>
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
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                      disabled={!isFieldEditable('bibStartNumber')}
                    />
                  </FormControl>
                  <FormDescription>Starting number for automatic bib assignment</FormDescription>
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
          <FieldWrapper fieldName="freeClubIds" competition={competition}>
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
                  <FormDescription>Clubs whose members don't pay registration fees</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FieldWrapper>

          <FieldWrapper fieldName="allowedClubIds" competition={competition}>
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
    </>
  );
}

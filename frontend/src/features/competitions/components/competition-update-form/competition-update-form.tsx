import { Form } from '@/components/ui/form';
import { UnsavedChangesDialog } from '@/components/unsaved-changes-dialog';
import { useClubs } from '@/features/clubs';
import { useOrganizationCompetitionStore } from '@/features/organization-competitions/store/organization-competition';
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { useEffect } from 'react';
import { FieldRulesLegend } from './field-rules-legend';
import { FormHeader } from './form-header';
import { FormSections } from './form-sections';
import { PublishConfirmDialog } from './publish-confirm-dialog';
import { useCompetitionForm } from './use-competition-form';

export function CompetitionUpdateForm() {
  const { currentCompetition } = useOrganizationCompetitionStore();
  const { data: clubs = [] } = useClubs();

  const {
    form,
    canEdit,
    isDirty,
    disabled,
    showPublishDialog,
    setShowPublishDialog,
    isPending,
    onSubmit,
    handlePublishToggle,
    confirmPublish,
    isFieldEditable,
  } = useCompetitionForm(currentCompetition);

  const { blocker, proceedNavigation, resetNavigation } = useUnsavedChanges({
    hasUnsavedChanges: isDirty && canEdit,
    message: 'You have unsaved changes to the competition. Are you sure you want to leave?',
  });

  // Keyboard shortcut for saving (Ctrl+S or Cmd+S)
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

  return (
    <div className="relative pb-24">
      <FormHeader
        competition={currentCompetition}
        isDirty={isDirty}
        canEdit={canEdit}
        disabled={disabled}
        isPending={isPending}
        onPublishToggle={handlePublishToggle}
        onSave={form.handleSubmit(onSubmit)}
      />

      <FieldRulesLegend />

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormSections
            form={form}
            competition={currentCompetition}
            clubs={clubs}
            isFieldEditable={isFieldEditable}
            canEdit={canEdit}
          />
        </form>
      </Form>

      <PublishConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={confirmPublish}
      />

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

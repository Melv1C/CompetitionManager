import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompetitionUpdate$, type Competition, type CompetitionUpdate } from '@repo/core/schemas';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUpdateCompetition } from '../../hooks/use-organization-competitions';
import { getFieldEditability } from '../../utils/field-editability';

export function useCompetitionForm(currentCompetition: Competition | null) {
  const updateMutation = useUpdateCompetition();
  const [canEdit, setCanEdit] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [pendingPublishValue, setPendingPublishValue] = useState(false);

  // Check edit permissions
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

  // Initialize form
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

  // Reset form when competition changes
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

  // Submit handler
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

  // Publish toggle handler
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

  // Confirm publish handler
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

  // Check if field is editable
  const isFieldEditable = useCallback(
    (fieldName: string) => {
      if (!currentCompetition) return false;
      const editability = getFieldEditability(fieldName, currentCompetition);
      return editability.isEditable && canEdit;
    },
    [currentCompetition, canEdit],
  );

  const { isDirty } = form.formState;
  const disabled = !isDirty || !canEdit || updateMutation.isPending;

  return {
    form,
    canEdit,
    isDirty,
    disabled,
    showPublishDialog,
    setShowPublishDialog,
    isPending: updateMutation.isPending,
    onSubmit,
    handlePublishToggle,
    confirmPublish,
    isFieldEditable,
  };
}

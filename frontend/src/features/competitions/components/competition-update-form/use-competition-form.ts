import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompetitionUpdate$, type Competition, type CompetitionUpdate } from '@repo/core/schemas';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUpdateCompetition } from '../../hooks/use-organization-competitions';
import { getFieldEditability } from '../../utils/field-editability';

/**
 * Helper function to compute only the changed fields between original and current data.
 * This ensures we only send modified fields to the backend, preventing validation errors
 * on locked fields that haven't actually changed.
 */
function getChangedFields(
  original: CompetitionUpdate,
  current: CompetitionUpdate,
): Partial<CompetitionUpdate> {
  const changes: Partial<CompetitionUpdate> = {};

  // Only check fields that exist in the original data
  (Object.keys(original) as Array<keyof CompetitionUpdate>).forEach(key => {
    const originalValue = original[key];
    const currentValue = current[key];

    // Skip if both are undefined/null
    if (
      (originalValue === undefined || originalValue === null) &&
      (currentValue === undefined || currentValue === null)
    ) {
      return;
    }

    // Handle Date comparison
    if (originalValue instanceof Date && currentValue instanceof Date) {
      if (originalValue.getTime() !== currentValue.getTime()) {
        console.log(`Date changed for ${key}:`, {
          original: originalValue.toISOString(),
          current: currentValue.toISOString(),
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changes[key] = currentValue as any;
      }
      return;
    }

    // Handle array comparison (for bibPermissions, freeClubIds, allowedClubIds)
    if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
      // Sort arrays before comparison to handle order differences
      const sortedOriginal = [...originalValue].sort();
      const sortedCurrent = [...currentValue].sort();
      const originalStr = JSON.stringify(sortedOriginal);
      const currentStr = JSON.stringify(sortedCurrent);
      if (originalStr !== currentStr) {
        console.log(`Array changed for ${key}:`, {
          original: originalValue,
          current: currentValue,
          sortedOriginal,
          sortedCurrent,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changes[key] = currentValue as any;
      }
      return;
    }

    // Handle primitive values (including undefined/null changes)
    if (originalValue !== currentValue) {
      console.log(`Value changed for ${key}:`, {
        original: originalValue,
        current: currentValue,
        originalType: typeof originalValue,
        currentType: typeof currentValue,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      changes[key] = currentValue as any;
    }
  });

  return changes;
}

export function useCompetitionForm(currentCompetition: Competition | null) {
  const updateMutation = useUpdateCompetition();
  const [canEdit, setCanEdit] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [pendingPublishValue, setPendingPublishValue] = useState(false);
  const [originalData, setOriginalData] = useState<CompetitionUpdate | null>(null);

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
      const orig = {
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
      };
      form.reset(orig);
      setOriginalData(orig);
    }
  }, [currentCompetition, form]);

  // Submit handler - only sends changed fields to prevent validation errors on locked fields
  const onSubmit = useCallback(
    async (data: CompetitionUpdate) => {
      if (!currentCompetition || !originalData) return;

      // Compute only the changed fields
      const changedFields = getChangedFields(originalData, data);

      // If no fields changed, don't send anything
      if (Object.keys(changedFields).length === 0) {
        console.warn('No changes detected, skipping update');
        return;
      }

      try {
        await updateMutation.mutateAsync({
          eid: currentCompetition.eid,
          data: changedFields,
        });
        // Update originalData with the new values after successful save
        const newValues = form.getValues();
        form.reset(newValues);
        setOriginalData(newValues);
      } catch (error) {
        console.error('Failed to update competition:', error);
      }
    },
    [currentCompetition, originalData, updateMutation, form],
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
            data: { isPublished: checked },
          });
        } catch (error) {
          console.error('Failed to update publish status:', error);
        }
      }
    },
    [currentCompetition, canEdit, updateMutation],
  );

  // Confirm publish handler
  const confirmPublish = useCallback(async () => {
    if (!currentCompetition) return;

    try {
      await updateMutation.mutateAsync({
        eid: currentCompetition.eid,
        data: { isPublished: pendingPublishValue },
      });
      setShowPublishDialog(false);
    } catch (error) {
      console.error('Failed to publish competition:', error);
    }
  }, [currentCompetition, updateMutation, pendingPublishValue]);

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
